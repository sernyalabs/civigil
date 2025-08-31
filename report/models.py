from django.db import models
import uuid

class IncidentReport(models.Model):
    # Unique ID
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Report details
    description = models.TextField()
    category = models.CharField(max_length=100, choices=[
        ("DRUG_PEDDLING", "Drug Peddling"),
        ("THEFT", "Theft"),
        ("VIOLENCE", "Violence"),
        ("OTHER", "Other"),
    ], default="OTHER")

    # Location details
    area_name = models.CharField(max_length=255)
    nearest_landmark = models.CharField(max_length=255, blank=True, null=True)
    address = models.CharField(max_length=500, blank=True, null=True)
    building_name = models.CharField(max_length=255, blank=True, null=True)
    floor_no = models.CharField(max_length=50, blank=True, null=True)

    # Map Pin (latitude & longitude)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    # Optional reporter phone
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    # Status workflow
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("IN_PROCESS", "In Process"),
        ("RESOLVED", "Resolved"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")

    # Token for tracking
    reporter_token = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True, editable=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.category} at {self.area_name} ({self.status})"


class IncidentEvidence(models.Model):
    """Optional evidence uploads"""
    incident = models.ForeignKey(IncidentReport, related_name="evidences", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="incident_evidence/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evidence for {self.incident.id}"
