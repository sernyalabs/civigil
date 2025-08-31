from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import IncidentReport
from .serializers import IncidentReportSerializer, ReportSerializer

from rest_framework.decorators import api_view


# ----------------------------
# 🔹 Admin ViewSet (CRUD)
# ----------------------------
class IncidentViewSet(viewsets.ModelViewSet):
    """
    Admin (authority) CRUD on incident reports.
    Only for staff/superusers.
    """
    queryset = IncidentReport.objects.all().order_by("-created_at")
    serializer_class = IncidentReportSerializer
    permission_classes = [IsAdminUser]  # only admin can access


# ----------------------------
# 🔹 Reporter APIs (No Login)
# ----------------------------
class ReportAPIView(APIView):
    """
    Reporter submits new report and tracks existing reports.
    Anonymous access allowed.
    """
    permission_classes = []  # anyone can submit / track
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # support images + json
    serializer_class=IncidentReportSerializer

    def post(self, request):
        """
        📌 Submit a new report (description, location, coords, images, phone no. optional).
        Returns tracking token.
        """
        serializer = IncidentReportSerializer(data=request.data)
        if serializer.is_valid():
            report = serializer.save()
            return Response({
                "message": "Incident submitted successfully",
                "report_token": str(report.reporter_token)
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        """
        📌 Track a report using ?token=<uuid>
        """
        token = request.query_params.get("token")
        if not token:
            return Response({"error": "Token required"}, status=status.HTTP_400_BAD_REQUEST)

        report = get_object_or_404(IncidentReport, reporter_token=token)
        serializer = ReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ----------------------------
# 🔹 Public Track Report by Token (Shortcut URL)
# ----------------------------
@api_view(["GET"])
def track_report(request, token):
    """
    Anyone can check a report’s status directly via URL:
    /track/<token>/
    """
    report = get_object_or_404(IncidentReport, reporter_token=token)
    serializer = ReportSerializer(report)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ----------------------------
# 🔹 Simple Home Page
# ----------------------------
def home(request):
    return HttpResponse("✅ Welcome to the Civiligian API dashboard!")


@api_view(['GET'])
def reports_by_phone(request):
    """
    Reporter can fetch all reports linked to their phone number.
    Useful if they forgot their token.
    """
    phone = request.query_params.get("phone_number")
    if not phone:
        return Response({"error": "Phone number required"}, status=status.HTTP_400_BAD_REQUEST)

    reports = IncidentReport.objects.filter(phone_number=phone)
    if not reports.exists():
        return Response({"message": "No reports found for this phone number"}, status=status.HTTP_404_NOT_FOUND)

    # Show tokens + status + created_at
    data = [
        {
            "report_token": str(report.reporter_token),
            "status": report.status,
            "created_at": report.created_at,
            "area_name": report.area_name,
            "nearest_landmark": report.nearest_landmark,
            "description": report.description,
        }
        for report in reports
    ]
    return Response(data, status=status.HTTP_200_OK)