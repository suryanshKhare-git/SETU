import os
import uvicorn

if __name__ == "__main__":
    # A usable local path without exposing a development OTP in deployments.
    os.environ.setdefault("DEMO_OTP_MODE", "true")
    print("Starting SETU Law Enforcement Intelligence Backend on http://127.0.0.1:8000...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
