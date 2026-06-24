"""
Custom Token Refresh View for BusinessUser
Handles token refresh without relying on AUTH_USER_MODEL (which is TechnicalAdmin)
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import AccessToken, UntypedToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from datetime import timedelta
import jwt
from django.conf import settings

from .models import BusinessUser, TechnicalAdmin


class BusinessTokenRefreshView(APIView):
    """
    Custom token refresh that supports both BusinessUser and TechnicalAdmin.
    The default SimpleJWT TokenRefreshView only looks up AUTH_USER_MODEL (TechnicalAdmin),
    which causes DoesNotExist errors for BusinessUser tokens.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Decode the refresh token to get claims
            decoded = jwt.decode(
                refresh_token,
                settings.SECRET_KEY,
                algorithms=['HS256'],
                options={"verify_exp": True}
            )
            
            user_id = decoded.get('user_id')
            user_type = decoded.get('user_type', 'TechnicalAdmin')
            
            if not user_id:
                return Response({
                    'error': 'Invalid token: no user_id'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Look up user based on user_type claim
            if user_type == 'BusinessUser':
                try:
                    user = BusinessUser.objects.get(id=user_id, is_active=True)
                except BusinessUser.DoesNotExist:
                    return Response({
                        'error': 'User not found or inactive'
                    }, status=status.HTTP_401_UNAUTHORIZED)
                
                # Generate new access token with BusinessUser claims
                access_token = AccessToken()
                access_token['user_id'] = user.id
                access_token['username'] = user.username
                access_token['business_code'] = user.business.business_code if user.business else None
                access_token['role'] = user.role
                access_token['user_type'] = 'BusinessUser'
                access_token.set_exp(lifetime=timedelta(minutes=60))
                
            else:
                try:
                    user = TechnicalAdmin.objects.get(id=user_id, is_active=True)
                except TechnicalAdmin.DoesNotExist:
                    return Response({
                        'error': 'User not found or inactive'
                    }, status=status.HTTP_401_UNAUTHORIZED)
                
                # Generate new access token for TechnicalAdmin
                access_token = AccessToken()
                access_token['user_id'] = user.id
                access_token['username'] = user.username
                access_token['user_type'] = 'TechnicalAdmin'
                access_token.set_exp(lifetime=timedelta(minutes=60))
            
            return Response({
                'access': str(access_token)
            }, status=status.HTTP_200_OK)
            
        except jwt.ExpiredSignatureError:
            return Response({
                'error': 'Refresh token has expired. Please login again.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        except (jwt.DecodeError, jwt.InvalidTokenError):
            return Response({
                'error': 'Invalid refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({
                'error': 'Token refresh failed',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
