"""
Custom JWT authentication class for BusinessUser
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

from .models import BusinessUser, TechnicalAdmin


class BusinessUserJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that supports BusinessUser
    """
    
    def get_user(self, validated_token):
        """
        Attempts to find and return a BusinessUser or TechnicalAdmin using the given validated token.
        """
        try:
            user_id = validated_token['user_id']
            user_type = validated_token.get('user_type', 'TechnicalAdmin')
            
            if user_type == 'BusinessUser':
                user_model = BusinessUser
            else:
                user_model = TechnicalAdmin
                
            user = user_model.objects.get(id=user_id, is_active=True)
            return user
            
        except KeyError:
            # user_id not in token
            return None
        except user_model.DoesNotExist:
            # User not found
            return None
        except Exception as e:
            # Other errors
            return None
        
    def authenticate(self, request):
        """
        Returns a two-tuple of `User` and token if a valid signature has been
        supplied using JWT-based authentication.  Otherwise returns `None`.
        """
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)
        
        if user and getattr(user, 'role', None) == 'admin':
            # Phase 2: Admins have a global account but operate in a specific branch context
            business_code = validated_token.get('business_code')
            if business_code:
                from businesses.models import Business
                try:
                    # Dynamically attach the business context to the user object
                    # so that all Phase 1 isolation logic (request.user.business) works flawlessly
                    business = Business.objects.get(business_code=business_code)
                    user.business = business
                except Business.DoesNotExist:
                    pass
        
        return (user, validated_token) if user else None