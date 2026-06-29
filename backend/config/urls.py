from django.contrib import admin
from django.urls import path
from core import views
from donations import views as donations_views
from donations import views_claims
from donations.views import health_check

urlpatterns = [
    # Health check endpoints for root-level and ALB target group routing (simplified to use donations health check)
    path('health/', health_check, name='health_check'),
    path('api/health/', health_check, name='api_health_check'),
    
    path('admin/', admin.site.urls),
    path('api/stats/', views.platform_stats),
    path('api/register/', views.register),
    path('api/login/', views.login_view),
    path('api/logout/', views.logout_view),
    path('api/profile/', views.profile),
    path('api/profile/update/', views.profile_update),
    path('api/verify-email/', views.verify_email),
    path('api/orgs/create/', views.org_create),
    path('api/orgs/my/', views.org_my),
    path('api/orgs/update/', views.org_update),
    path('api/donations/', donations_views.donation_list),
    path('api/donations/create/', donations_views.donation_create),
    path('api/donations/my/', donations_views.my_donations),
    path('api/donations/<int:pk>/', donations_views.donation_detail),
    path('api/donations/<int:pk>/update/', donations_views.donation_update),
    path('api/donations/<int:pk>/cancel/', donations_views.donation_cancel),
    path('api/claims/create/', views_claims.claim_create),
    path('api/claims/my/', views_claims.my_claims),
    path('api/claims/<int:pk>/verify-otp/', views_claims.verify_otp),
    path('api/notifications/', views.notifications_list),
    path('api/notifications/unread-count/', views.notifications_unread_count),
    path('api/notifications/<int:pk>/read/', views.notification_read),
    path('api/notifications/read-all/', views.notifications_read_all),
    path('api/admin/stats/', views.admin_stats),
    path('api/admin/ngos/pending/', views.admin_pending_ngos),
    path('api/admin/ngos/<int:pk>/verify/', views.admin_verify_ngo),
    path('api/admin/ngos/<int:pk>/reject/', views.admin_reject_ngo),
    path('api/admin/email-logs/', views.admin_email_logs),
]

from django.conf import settings
from django.conf.urls.static import static
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
