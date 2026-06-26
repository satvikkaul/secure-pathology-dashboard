import os
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

_KNOWN_PLACEHOLDERS = {
    "dev-secret-key-for-local-testing-only-change-later",
    "REPLACE_THIS_WITH_A_REAL_SECRET",
}
_raw_key = os.getenv("SECRET_KEY", "")
if not _raw_key or _raw_key in _KNOWN_PLACEHOLDERS:
    raise RuntimeError(
        "SECRET_KEY is missing or still set to the placeholder value. "
        "Set a strong random SECRET_KEY in backend/.env before starting the server."
    )
SECRET_KEY = _raw_key
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": subject, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> str:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    sub: str | None = payload.get("sub")
    if sub is None:
        raise JWTError("Missing subject claim")
    return sub
