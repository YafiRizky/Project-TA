"""
Security Throttling Classes for DRF API Endpoints
Prevents bot scanner probes, brute-force attacks, and registration spam.
Generous limits for legitimate users and testers, strict against bot floods.
"""
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

class RegisterRateThrottle(AnonRateThrottle):
    scope = 'register'
    rate = '30/hour'

class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'
    rate = '60/minute'

class KasirCreationThrottle(UserRateThrottle):
    scope = 'kasir_create'
    rate = '60/hour'
