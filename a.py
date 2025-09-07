import json
import boto3
import os
import uuid # ユニークIDを生成するために追加

# Bedrockクライアントを初期化
bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name='ap-northeast-1'
)

# DynamoDBクライアントを初期化
dynamodb = boto3.resource('dynamodb')
quizzies_table = dynamodb.Table('quizzies') # テーブル名を指定

def create_prompt(note_content, num_questions, difficulty, question_format):
    """
    Bedrockに渡すプロンプトを生成する関数
    (この関数は前回の修正から変更ありません)
    """
    if question_format == '記述式':
        format_example = """{
            "quizzies": [
                {
                    "question": "問題文",
                    "answer": "正解のテキスト",
                    "explanation": "なぜこの答えになるのかの解説",
                    "intent": "この問題から何を学ぶべきかの出題意図"
                }
            ]
        }"""
        instruction = f"- 問題形式は、「{question_format}」とし、答えは簡潔な単語や文章とします。"
    elif question_format == '正誤判定':
        format_example = """{
            "quizzies": [
                {
                    "question": "問題文",
                    "choices": ["正", "誤"],
                    "answer": "正",
                    "explanation": "なぜこの答えになるのかの解説",
                    "intent": "この問題から何を学ぶべきかの出題意図"
                }
            ]
        }"""
        instruction = f"- 問題形式は、「{question_format}」とし、提示された文章が正しいか誤っているかを問う形式とします。"
    else: # デフォルトは選択式
        format_example = """{
            "quizzies": [
                {
                    "question": "問題文",
                    "choices": [
                    "選択肢1",
                    "選択肢2",
                    "選択肢3",
                    "選択肢4"
                    ],
                    "answer": "正解の選択肢",
                    "explanation": "なぜこの答えになるのかの解説",
                    "intent": "この問題から何を学ぶべきかの出題意図"
                }
            ]
        }"""
        instruction = f"- 問題形式は、「{question_format}」とし、4つの選択肢の中から1つの正解を選ぶ形式とします。"

    # 最終的なプロンプトを組み立てる
    prompt = f"""
    あなたは優秀な教育者です。以下の学習ノートの内容に基づき、学習者が知識の定着度を確認するためのクイズを作成してください。

    # 指示
    - 難易度「{difficulty}」レベルの問題を「{num_questions}問」作成してください。
    {instruction}
    - 各問題には、なぜその答えになるのかの「解説」と、この問題が何を学ぶためのものかという「出題意図」を付けてください。
    - 回答は必ず指定したJSON形式で出力してください。他のテキストは含めないでください。

    # 学習ノート
    ---
    {note_content}
    ---

    # 出力形式 (JSON)
    {format_example}
    """
    return prompt

def lambda_handler(event, context):
    """
    Lambda関数のメインハンドラー
    API Gatewayからのリクエストを処理し、Bedrockでクイズを生成し、DynamoDBに保存する
    """
    try:
        # リクエスト全体をログ出力
        print(f"Raw event keys: {list(event.keys())}")
        print(f"Event body type: {type(event.get('body'))}")
        print(f"Event body content: {event.get('body')}")
        
        raw_body = event.get('body', '{}')
        if raw_body is None:
            raw_body = '{}'
        
        body = json.loads(raw_body)
        print(f"Parsed body: {json.dumps(body)}")

        note_content = body.get('note')
        note_ids = body.get('noteId')  # 複数のnoteIdを受け取る（配列または文字列）
        num_questions = int(body.get('num_questions', 5))
        difficulty = body.get('difficulty', '標準')
        question_format = body.get('question_format', '選択式')

        # デバッグ用ログ
        print(f"Received parameters: note_content length={len(note_content) if note_content else 0}, note_ids={note_ids}, type={type(note_ids)}")

        # noteIdを配列に正規化
        if isinstance(note_ids, str):
            # 文字列の場合はカンマ区切りで分割
            note_ids = [id.strip() for id in note_ids.split(',') if id.strip()]
        elif isinstance(note_ids, list):
            # 既に配列の場合はそのまま使用
            note_ids = [str(id) for id in note_ids if id]
        else:
            note_ids = []

        print(f"Normalized note_ids: {note_ids}")

        # noteIdがない場合はエラーを返す
        if not note_content or not note_ids:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'ノートの内容(note)またはnoteIdがありません。received: note_content={bool(note_content)}, note_ids={note_ids}'})
            }

        # Bedrockへのプロンプトを生成
        prompt = create_prompt(note_content, num_questions, difficulty, question_format)

        # Bedrockモデルの呼び出し
        response = bedrock_runtime.invoke_model(
            modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 4096,
                "messages": [
                    {
                        "role": "user",
                        "content": [{"type": "text", "text": prompt}]
                    }
                ]
            })
        )

        response_body = json.loads(response['body'].read())
        quiz_json_str = response_body['content'][0]['text']
        final_response = json.loads(quiz_json_str)

        # ★ここから追加: 生成したクイズをDynamoDBに保存
        saved_quizzies = []
        for quiz in final_response.get('quizzies', []):
            quiz_id = str(uuid.uuid4())
            item_to_save = {
                'quizId': quiz_id, # Partition Key
                'noteIds': note_ids,  # 複数のnoteIdを配列として保存
                'question': quiz.get('question'),
                'answer': quiz.get('answer'),
                'explanation': quiz.get('explanation'),
                'intent': quiz.get('intent'),
                # choicesは存在する場合のみ追加
                'choices': quiz.get('choices', None)
            }
            # Noneの属性はDynamoDBに保存しない
            item_to_save = {k: v for k, v in item_to_save.items() if v is not None}

            quizzies_table.put_item(Item=item_to_save)
            item_to_save['quizId'] = quiz_id # フロントに返すためにIDを追加
            saved_quizzies.append(item_to_save)
        
        # フロントには保存後のデータ（quizIdを含む）を返す
        response_to_frontend = {"quizzies": saved_quizzies}

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response_to_frontend, ensure_ascii=False)
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'クイズの生成または保存中にエラーが発生しました: {str(e)}'})
        }