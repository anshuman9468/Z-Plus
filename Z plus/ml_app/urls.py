from django.urls import path
from . import views
urlpatterns = [
    path('upload/', views.upload_dataset),
    path('status/<str:job_id>/', views.job_status),
    path('verify/', views.verify_proof),
    path('verifications/', views.get_verification_history),
    path('proof/<str:job_id>/', views.download_proof),
    path('certificate/<str:job_id>/', views.generate_certificate),
    path('clean/', views.clean_data),
    path('clean/download/<str:job_id>/', views.download_cleaned_data),
    path('columns/', views.get_columns),
    path('download-all/<str:job_id>/', views.download_all_zip),
]
