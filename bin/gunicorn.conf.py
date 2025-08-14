wsgi_app = "config.wsgi:application"
preload_app = True
daemon = False
raw_env = ["DJANGO_SETTINGS_MODULE=config.settings"]
workers = 1
threads = 2
max_requests = 500
max_requests_jitter = 40
