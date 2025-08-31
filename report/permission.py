# from rest_framework.permissions import BasePermission

# class IsAuthority(BasePermission):
#     """
#     Only authority users can list, update, or delete reports.
#     """
#     def has_permission(self, request, view):
#         return request.user and request.user.is_authenticated and getattr(request.user, "is_authority", False)


# class IsAnonymousReporterOrReadOnly(BasePermission):
#     """
#     - Anyone can POST (submit report).
#     - Authority can GET/PUT/PATCH/DELETE.
#     """
#     def has_permission(self, request, view):
#         if request.method == "POST":
#             return True
#         return request.user and request.user.is_authenticated and getattr(request.user, "is_authority", False)
