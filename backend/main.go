package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type Question struct {
	ID         int      `json:"id"`
	Question   string   `json:"question"`
	Answer     string   `json:"answer"`
	Category   string   `json:"category"`
	Difficulty string   `json:"difficulty"`
	Options    []string `json:"options"`
	Type       string   `json:"type"`
}

var questions = []Question{
	{
		ID:         1,
		Question:   "What is a Kubernetes Pod and what is its role in a cluster?",
		Answer:     "A Pod is the smallest deployable unit in Kubernetes, running one or more containers that share storage, network, and a specification for how to run them.",
		Category:   "Core Concepts",
		Difficulty: "Easy",
		Type:       "open-ended",
	},
	{
		ID:         2,
		Question:   "How does a Kubernetes Service ensure load balancing across Pods?",
		Answer:     "A Service distributes traffic across Pods using a consistent IP and DNS name, leveraging kube-proxy for load balancing via round-robin or other policies.",
		Category:   "Networking",
		Difficulty: "Medium",
		Type:       "open-ended",
	},
	{
		ID:         3,
		Question:   "What is the purpose of a ConfigMap in Kubernetes?",
		Answer:     "A ConfigMap stores configuration data as key-value pairs, allowing applications to externalize configuration and decouple environment-specific settings from container images.",
		Category:   "Configuration",
		Difficulty: "Easy",
		Type:       "open-ended",
	},
	{
		ID:         4,
		Question:   "Which Kubernetes component maintains the desired state of the cluster?",
		Answer:     "The Controller Manager",
		Category:   "Architecture",
		Difficulty: "Medium",
		Type:       "multiple-choice",
	},
	{
		ID:         5,
		Question:   "Explain how Horizontal Pod Autoscaling (HPA) works in Kubernetes.",
		Answer:     "HPA scales the number of Pods in a Deployment or ReplicaSet based on CPU, memory, or custom metrics, using the Metrics Server to adjust replicas within defined limits.",
		Category:   "Scaling",
		Difficulty: "Hard",
		Type:       "open-ended",
	},
	{
		ID:         6,
		Question:   "What is the difference between a ReplicaSet and a ReplicationController?",
		Answer:     "ReplicaSets support set-based selectors for managing Pods, while ReplicationControllers use equality-based selectors and are an older, less flexible construct.",
		Category:   "Workloads",
		Difficulty: "Medium",
		Type:       "open-ended",
	},
	{
		ID:         7,
		Question:   "What is the purpose of the kube-scheduler in a Kubernetes cluster?",
		Answer:     "The kube-scheduler assigns Pods to nodes based on resource requirements, constraints, and policies to optimize cluster utilization.",
		Category:   "Architecture",
		Difficulty: "Medium",
		Type:       "open-ended",
	},
	{
		ID:         8,
		Question:   "What is a PersistentVolumeClaim (PVC) used for?",
		Answer:     "A PVC requests storage resources from a PersistentVolume, allowing Pods to use storage dynamically without directly managing the underlying storage.",
		Category:   "Storage",
		Difficulty: "Medium",
		Type:       "open-ended",
	},
	{
		ID:         9,
		Question:   "Which command is used to view the logs of a specific Pod?",
		Answer:     "kubectl logs <pod-name>",
		Category:   "Commands",
		Difficulty: "Easy",
		Type:       "short-answer",
	},
	{
		ID:         10,
		Question:   "How does a Kubernetes Ingress resource manage external traffic?",
		Answer:     "An Ingress exposes HTTP/HTTPS routes to services, typically with an Ingress Controller, enabling load balancing, SSL termination, and path-based routing.",
		Category:   "Networking",
		Difficulty: "Hard",
		Type:       "open-ended",
	},
	{
		ID:         11,
		Question:   "What is the role of the kubelet in a Kubernetes node?",
		Answer:     "The kubelet is an agent that runs on each node, ensuring containers in Pods are running and healthy by communicating with the Kubernetes API server.",
		Category:   "Architecture",
		Difficulty: "Medium",
		Type:       "open-ended",
	},
	{
		ID:         12,
		Question:   "What is a Namespace in Kubernetes used for?",
		Answer:     "Namespaces provide a way to divide cluster resources among multiple users or projects, enabling resource isolation and access control.",
		Category:   "Core Concepts",
		Difficulty: "Easy",
		Type:       "open-ended",
	},
	{
		ID:         13,
		Question:   "Which Kubernetes object is used to run a one-off task?",
		Answer:     "Job",
		Category:   "Workloads",
		Difficulty: "Medium",
		Type:       "short-answer",
	},
	{
		ID:         14,
		Question:   "How does a DaemonSet ensure a Pod runs on every node?",
		Answer:     "A DaemonSet ensures that a copy of a specified Pod runs on every node in the cluster, automatically adding Pods to new nodes as they join.",
		Category:   "Workloads",
		Difficulty: "Medium",
		Type:       "open-ended",
	},
	{
		ID:         15,
		Question:   "What is the purpose of the kube-apiserver?",
		Answer:     "The kube-apiserver is the primary control plane component that exposes the Kubernetes API, handling requests and managing the cluster's state.",
		Category:   "Architecture",
		Difficulty: "Hard",
		Type:       "open-ended",
	},
	{
		ID:         16,
		Question:   "What command scales a Deployment to 5 replicas?",
		Answer:     "kubectl scale deployment <deployment-name> --replicas=5",
		Category:   "Commands",
		Difficulty: "Easy",
		Type:       "short-answer",
	},
	{
		ID:         17,
		Question:   "How does a Kubernetes Secret differ from a ConfigMap?",
		Answer:     "Secrets store sensitive data like passwords or keys in base64-encoded format, while ConfigMaps store non-sensitive configuration data as plain text.",
		Category:   "Configuration",
		Difficulty: "Medium",
		Type:       "open-ended",
	},
	{
		ID:         18,
		Question:   "What is the purpose of a ServiceAccount in Kubernetes?",
		Answer:     "A ServiceAccount provides an identity for Pods to interact with the Kubernetes API, enabling authentication and authorization for cluster operations.",
		Category:   "Security",
		Difficulty: "Medium",
		Type:       "open-ended",
	},
	{
		ID:         19,
		Question:   "Which Kubernetes object schedules recurring tasks?",
		Answer:     "CronJob",
		Category:   "Workloads",
		Difficulty: "Medium",
		Type:       "short-answer",
	},
	{
		ID:         20,
		Question:   "How does the Cluster Autoscaler adjust the size of a Kubernetes cluster?",
		Answer:     "The Cluster Autoscaler adds or removes nodes based on Pod scheduling needs, scaling up when Pods cannot be scheduled and scaling down when nodes are underutilized.",
		Category:   "Scaling",
		Difficulty: "Hard",
		Type:       "open-ended",
	},
	{
		ID:         21,
		Question:   "What is the smallest deployable unit in Kubernetes?",
		Answer:     "Pod",
		Category:   "Basics",
		Difficulty: "Easy",
		Options:    []string{"Container", "Pod", "Service", "Deployment"},
		Type:       "multiple-choice",
	},
	{
		ID:         22,
		Question:   "Explain the difference between a Deployment and a StatefulSet",
		Answer:     "Deployments are for stateless apps with identical replicas, while StatefulSets maintain stable network identities and persistent storage for stateful applications.",
		Category:   "Workloads",
		Difficulty: "Medium",
		Type:       "open-ended",
	},
}

func getRandomQuestions(w http.ResponseWriter, r *http.Request) { // Fixed function name
	w.Header().Set("Content-Type", "application/json") // Fixed method call

	vars := mux.Vars(r)
	count := 5
	if c, err := strconv.Atoi(vars["count"]); err == nil {
		count = c
	}

	if count > len(questions) {
		count = len(questions)
	}

	// Create a copy to avoid modifying the original slice
	questionsCopy := make([]Question, len(questions))
	copy(questionsCopy, questions)

	rand.Shuffle(len(questionsCopy), func(i, j int) {
		questionsCopy[i], questionsCopy[j] = questionsCopy[j], questionsCopy[i]
	})

	selectedQuestions := questionsCopy[:count]
	json.NewEncoder(w).Encode(selectedQuestions)
}

func getQuestionsByCategory(w http.ResponseWriter, r *http.Request) { // Added missing function
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	category := vars["category"]

	var filteredQuestions []Question
	for _, q := range questions {
		if q.Category == category {
			filteredQuestions = append(filteredQuestions, q)
		}
	}

	json.NewEncoder(w).Encode(filteredQuestions)
}

func getCategories(w http.ResponseWriter, r *http.Request) { // Fixed function name and method call
	w.Header().Set("Content-Type", "application/json") // Fixed method call

	categoryMap := make(map[string]bool)
	for _, q := range questions {
		categoryMap[q.Category] = true
	}

	var categories []string
	for category := range categoryMap {
		categories = append(categories, category)
	}

	json.NewEncoder(w).Encode(categories)
}

func main() {
	r := mux.NewRouter()

	// API ROUTES
	r.HandleFunc("/api/questions/random/{count}", getRandomQuestions).Methods("GET")
	r.HandleFunc("/api/questions/category/{category}", getQuestionsByCategory).Methods("GET")
	r.HandleFunc("/api/categories", getCategories).Methods("GET")
	r.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	// CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(r)

	log.Println("Server starting on :8080") // Added colon for clarity
	log.Fatal(http.ListenAndServe(":8080", handler))
}
