output "frontend_site_url" {
  value = aws_s3_bucket_website_configuration.frontend_website.website_endpoint
}

output "media_bucket_url" {
  value = "https://${aws_s3_bucket.media_bucket.bucket}.s3.amazonaws.com/"
}
