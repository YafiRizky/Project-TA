"""
Security Throttling Classes for DRF API Endpoints
Prevents bot scanner probes, brute-force attacks, and registration spam.
"""
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

class RegisterRateThrottle(AnonRateThrottle):
    scope = 'register'
    rate = '5/hour'

class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'
    rate = '15/minute'

class KasirCreationThrottle(UserRateThrottle):
    scope = 'kasir_create'
    rate = '20/hour'
