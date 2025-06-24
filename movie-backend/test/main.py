import secrets
import os

# 生成一个URL安全的、包含32字节（256位）随机性的字符串
# 32字节足够用于 HMAC-SHA256 (HS256) 签名算法
jwt_secret_key = secrets.token_urlsafe(32)
print(jwt_secret_key)