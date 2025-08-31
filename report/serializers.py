from rest_framework import serializers
from .models import IncidentReport, IncidentEvidence


class IncidentEvidenceSerializer(serializers.ModelSerializer):
    """Handles evidence (images) attached to reports"""
    class Meta:
        model = IncidentEvidence
        fields = ["id", "image", "uploaded_at"]


class IncidentReportSerializer(serializers.ModelSerializer):
    """
    Main serializer for IncidentReport
    - Reporters can submit description, location, phone, lat/lon
    - They can also upload multiple images
    """
    evidences = IncidentEvidenceSerializer(many=True, read_only=True)
    images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False,
        help_text="Upload one or more images as evidence"
    )

    class Meta:
        model = IncidentReport
        fields = [
            "id",
            "description",
            "category",
            "area_name",
            "nearest_landmark",
            "address",
            "building_name",
            "floor_no",
            "latitude",
            "longitude",
            "phone_number",
            "status",
            "created_at",
            "updated_at",
            "reporter_token",
            "evidences",
            "images",   # only for POST, not returned in GET
        ]
        read_only_fields = ["status", "created_at", "updated_at", "reporter_token"]

    def create(self, validated_data):
        """Custom create method to handle images separately"""
        images = validated_data.pop("images", [])
        report = IncidentReport.objects.create(**validated_data)

        for img in images:
            IncidentEvidence.objects.create(incident=report, image=img)

        return report


class ReportSerializer(serializers.ModelSerializer):
    """
    Read-only serializer used for tracking reports
    """
    evidences = IncidentEvidenceSerializer(many=True, read_only=True)

    class Meta:
        model = IncidentReport
        fields = [
            "id",
            "description",
            "category",
            "area_name",
            "nearest_landmark",
            "address",
            "building_name",
            "floor_no",
            "latitude",
            "longitude",
            "phone_number",
            "status",
            "created_at",
            "updated_at",
            "reporter_token",
            "evidences",
        ]
        read_only_fields = fields
