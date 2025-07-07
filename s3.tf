resource "aws_s3_bucket" "media_bucket" {
  bucket        = "${var.project_name}-media"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "media_block" {
  bucket                  = aws_s3_bucket.media_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "media_policy" {
  bucket     = aws_s3_bucket.media_bucket.id
  depends_on = [aws_s3_bucket_public_access_block.media_block]

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicRead",
        Effect    = "Allow",
        Principal = "*",
        Action    = ["s3:GetObject"],
        Resource  = "${aws_s3_bucket.media_bucket.arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket" "frontend_bucket" {
  bucket        = "${var.project_name}-frontend"
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "frontend_website" {
  bucket = aws_s3_bucket.frontend_bucket.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend_block" {
  bucket                  = aws_s3_bucket.frontend_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket     = aws_s3_bucket.frontend_bucket.id
  depends_on = [aws_s3_bucket_public_access_block.frontend_block]

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = ["s3:GetObject"],
        Resource  = "${aws_s3_bucket.frontend_bucket.arn}/*"
      }
    ]
  })
}
