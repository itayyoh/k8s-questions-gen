package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Question struct {
	ID         primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Question   string             `json:"question" bson:"question"`
	Answer     string             `json:"answer" bson:"answer"`
	Category   string             `json:"category" bson:"category"`
	Difficulty string             `json:"difficulty" bson:"difficulty"`
	Options    []string           `json:"options,omitempty" bson:"options,omitempty"`
	Type       string             `json:"type" bson:"type"`
}

var mongoClient *mongo.Client
var questionsCollection *mongo.Collection

func connectDB() {
	// Get MongoDB URL from environment variable (set in docker-compose)
	mongoURL := os.Getenv("MONGO_URL")
	if mongoURL == "" {
		mongoURL = "mongodb://localhost:27017" // fallback for local development
	}

	// Create context with timeout for connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Connect to MongoDB
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURL))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Test the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	log.Println("Connected to MongoDB successfully")

	// Set global variables
	mongoClient = client
	questionsCollection = client.Database("k8s_interview").Collection("questions")

	// Seed initial data if collection is empty
	seedData()
}

func seedData() {
	ctx := context.Background()

	// Check if collection already has data
	count, err := questionsCollection.CountDocuments(ctx, bson.D{})
	if err != nil {
		log.Printf("Error checking collection count: %v", err)
		return
	}

	// Only seed if empty
	if count > 0 {
		log.Printf("Collection already has %d questions, skipping seed", count)
		return
	}

	data, err := os.ReadFile("questions.json")
	if err != nil {
		log.Printf("Error reading file: %v", err)
		return
	}

	var questions []Question
	err = json.Unmarshal(data, &questions)
	if err != nil {
		log.Printf("Error parsing questions JSON: %v", err)
		return
	}

	var docs []interface{}
	for _, q := range questions {
		docs = append(docs, q)
	}

	// Insert all questions
	result, err := questionsCollection.InsertMany(ctx, docs)
	if err != nil {
		log.Printf("Error seeding data: %v", err)
		return
	}

	log.Printf("Seeded %d questions successfully", len(result.InsertedIDs))
}

func getRandomQuestions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	count := 5
	if c, err := strconv.Atoi(vars["count"]); err == nil {
		count = c
	}

	ctx := context.Background()

	// MongoDB aggregation pipeline to get random documents
	pipeline := []bson.M{
		{"$sample": bson.M{"size": count}}, // MongoDB's built-in random sampling
	}

	cursor, err := questionsCollection.Aggregate(ctx, pipeline)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var questions []Question
	if err = cursor.All(ctx, &questions); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(questions)
}

func getQuestionsByCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	category := vars["category"]

	ctx := context.Background()

	// Find questions by category
	filter := bson.M{"category": category}
	cursor, err := questionsCollection.Find(ctx, filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var questions []Question
	if err = cursor.All(ctx, &questions); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(questions)
}

func getCategories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	ctx := context.Background()

	// Get distinct categories from the collection
	categories, err := questionsCollection.Distinct(ctx, "category", bson.D{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(categories)
}

func main() {
	// Connect to database first
	connectDB()

	// Ensure we close the connection when the program exits
	defer func() {
		if mongoClient != nil {
			mongoClient.Disconnect(context.Background())
		}
	}()

	r := mux.NewRouter()

	// API routes
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

	log.Println("Server starting on :8082")
	log.Fatal(http.ListenAndServe(":8082", handler))
}
