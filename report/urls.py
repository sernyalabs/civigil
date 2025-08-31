from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IncidentViewSet, ReportAPIView, track_report, home ,reports_by_phone

# Admin API with router (CRUD)
admin_router = DefaultRouter()
admin_router.register(r'incidents', IncidentViewSet, basename='incident')


urlpatterns = [
    # Home endpoint (optional)
    path('', home, name="home"),

    # ---------------- Admin APIs ----------------
    path('admin-api/', include(admin_router.urls)),

    # ---------------- User APIs ----------------
    path('user-api/report/', ReportAPIView.as_view(), name="report"),

    # ---------------- Public Tracking ----------------
    path('track/<str:token>/', track_report, name="track-report"),

    path('user-api/reports-by-phone/', reports_by_phone, name='reports-by-phone'),
]
