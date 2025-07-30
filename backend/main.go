package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
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

type SubmissionRequest struct {
	QuestionID string `json:"question_id"`
	Answer     string `json:"answer"`
	Type       string `json:"type"`
}

type SubmissionResponse struct {
	Correct       bool   `json:"correct"`
	CorrectAnswer string `json:"correct_answer"`
	Explanation   string `json:"explanation,omitempty"`
	Score         int    `json:"score,omitempty"`
}

type JobApplication struct {
	ID          primitive.ObjectID
	Company     string
	Statuss     string
	Location    string
	AppliedDate string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

var mongoClient *mongo.Client
var questionsCollection *mongo.Collection
var JobApplicationCollection *mongo.Collection

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

// Helper function to serve JSON files
func serveJSONFile(filename string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		data, err := os.ReadFile(filename)
		if err != nil {
			log.Printf("Error reading file %s: %v", filename, err)
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}

		w.Write(data)
	}
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

func submitAnswer(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var submission SubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&submission); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	objectID, err := primitive.ObjectIDFromHex(submission.QuestionID)
	if err != nil {
		http.Error(w, "Invalid question id", http.StatusBadRequest)
		return
	}

	var question Question
	err = questionsCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&question)
	if err != nil {
		http.Error(w, "Question not found", http.StatusNotFound)
		return
	}

	response := SubmissionResponse{
		CorrectAnswer: question.Answer,
	}

	if question.Type == "multiple-choice" {
		response.Correct = strings.EqualFold(strings.TrimSpace(submission.Answer), strings.TrimSpace(question.Answer))
	} else {
		response.Correct = containsKeywords(submission.Answer, question.Answer)
	}

	if response.Correct {
		response.Score = 1
		response.Explanation = "Correct!"
	} else {
		response.Score = 0
		response.Explanation = "Incorrect. Please review the correct answer."
	}

	json.NewEncoder(w).Encode(response)
}

func containsKeywords(userAnswer, CorrectAnswer string) bool {
	userLower := strings.ToLower(userAnswer)
	correctLower := strings.ToLower(CorrectAnswer)

	return strings.Contains(userLower, correctLower) || strings.Contains(correctLower, userLower)
}

func addQuestion(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var newQuestion Question
	err := json.NewDecoder(r.Body).Decode(&newQuestion)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(newQuestion.Question) == "" {
		http.Error(w, "Question field is required", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(newQuestion.Category) == "" {
		http.Error(w, "Category required", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(newQuestion.Answer) == "" {
		http.Error(w, "Answer field required", http.StatusBadRequest)
		return
	}

	if newQuestion.Type != "open-ended" && newQuestion.Type != "multiple-choice" {
		http.Error(w, "Type must be either 'open-ended' or 'multiple-choice'", http.StatusBadRequest)
		return
	}

	if newQuestion.Type == "multiple-choice" {
		if len(newQuestion.Options) < 2 {
			http.Error(w, "Multiple choice questions must have at least 2 options", http.StatusBadRequest)
			return
		}

		answerFound := false
		for _, option := range newQuestion.Options {
			if strings.TrimSpace(option) == strings.TrimSpace(newQuestion.Answer) {
				answerFound = true
				break
			}
		}
		if !answerFound {
			http.Error(w, "Answer must be one of the provided options", http.StatusBadRequest)
			return
		}
	}

	if newQuestion.Difficulty == "" {
		newQuestion.Difficulty = "Easy"
	}

	validDifficulties := []string{"Easy", "Medium", "Hard"}
	validDifficulty := false
	for _, diff := range validDifficulties {
		if newQuestion.Difficulty == diff {
			validDifficulty = true
			break
		}
	}
	if !validDifficulty {
		http.Error(w, "Difficulty must be between Easy,Medium,Hard!!", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := questionsCollection.InsertOne(ctx, newQuestion)
	if err != nil {
		log.Printf("Error inserting question: %v", err)
		http.Error(w, "Failed to save question to db", http.StatusInternalServerError)
		return
	}

	newQuestion.ID = result.InsertedID.(primitive.ObjectID)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "questions added",
		"question": newQuestion,
		"id":       newQuestion.ID.Hex(),
	})
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

	// Existing API routes (questions come from MongoDB, seeded from questions.json)
	r.HandleFunc("/api/questions/random/{count}", getRandomQuestions).Methods("GET")
	r.HandleFunc("/api/questions/category/{category}", getQuestionsByCategory).Methods("GET")
	r.HandleFunc("/api/categories", getCategories).Methods("GET")
	r.HandleFunc("/api/submit", submitAnswer).Methods("POST")
	r.HandleFunc("/api/questions", addQuestion).Methods("POST")

	// New JSON data endpoints (serve static JSON files)
	r.HandleFunc("/api/ui-config", serveJSONFile("ui-config.json")).Methods("GET")
	r.HandleFunc("/api/interview-scenarios", serveJSONFile("interview-scenarios.json")).Methods("GET")
	r.HandleFunc("/api/homepage-data", serveJSONFile("homepage-data.json")).Methods("GET")

	// Health check
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
