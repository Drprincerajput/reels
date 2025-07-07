# lambda.tf
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda_clips"
  output_path = "${path.module}/lambda_clips.zip"
}

resource "aws_lambda_function" "clips_api" {
  function_name = "${var.project_name}-get-clips"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "main.lambda_handler"
  runtime       = "python3.11"
  filename      = data.archive_file.lambda_zip.output_path

  environment {
    variables = {
      DDB_TABLE_NAME = aws_dynamodb_table.clips_table.name
    }
  }
}
