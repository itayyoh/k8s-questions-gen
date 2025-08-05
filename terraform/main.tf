terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
        source = "hashicorp/google"
        version = "~> 5.0"
    }
    google-beta = {
        source = "hashicorp/google-beta"
        version = "~> 5.0"
    }
  }
  
  backend "gcs" {
     bucket = "my-tf-bucket"
     prefix = "k8s-interview/terraform.state"
  }
}

provider "google" {
    project = var.project_id
    region = var.region
}

provider "google-beta" {
    project = var.project_id
    region = var.region
}

resource "google_project_service" "required_apis" {
    for_each = toset([
        "container.googleapis.com",
        "cloudbuild.googleapis.com",
        "containerregistery.googleapis.com",
        "compute.googleapis.com",
        "monitoring.googleapis.com",
        "logging.googleapis.com"
    ])

    project = var.project_id
    region = var.region

    disable_on_destroy = false
    
}

resource "google_container_cluster" "k8s_interview_cluster" {
    name = var.cluster_name
    location = var.region

    enable_autopilot = true

    release_channel {
        channel = var.release_channel
    }

    network = google_compute_network.vpc.name
    subnetwork = google_compute_subnetwork.subnet.name

    ip_allocation_policy {
        cluster_secondary_range_name = "pods"
        services_secondary_range_name = "services"
    }

    master_authorized_networks_config {
        cidr_blocks {
            cidr_block = "0.0.0.0/0"
            display_name = "All"
        }
    }

    private_cluster_config {
        enable_private_nodes = true
        enable_private_endpoint = false
        master_ipv4_cidr_block = "172.16.0.0/28"
    }

    workload_identity_workload {
        workload_pool = "${var.project_id}.svc.id.goog"
    }
}


