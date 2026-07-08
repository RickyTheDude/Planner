import { Roadmap } from "../store/types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function generateRoadmap(topic: string): Promise<Roadmap> {
  // Simulate a 2-second AI generation delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const roadmapId = generateId();

  return {
    id: roadmapId,
    topic,
    createdAt: Date.now(),
    nodes: [
      {
        id: `${roadmapId}-n1`,
        label: "Introduction & Setup",
        isCompleted: false,
        material: {
          markdownBody: `# Introduction to ${topic}

Welcome to your learning journey! This module covers the fundamentals and sets up your development environment.

## Why Learn ${topic}?

${topic} is one of the most important skills in modern software development. Understanding it deeply will give you a significant advantage in your career.

## Key Concepts

- **Core Philosophy**: Understanding the fundamental design principles
- **Ecosystem**: The tools, libraries, and community surrounding ${topic}
- **Practical Applications**: Real-world use cases you'll encounter

## Setting Up Your Environment

\`\`\`bash
# Install the required tools
curl -fsSL https://example.com/install.sh | bash

# Verify the installation
${topic.toLowerCase().replace(/\s+/g, "-")} --version

# Create your first project
mkdir my-first-project && cd my-first-project
${topic.toLowerCase().replace(/\s+/g, "-")} init
\`\`\`

## What You'll Learn

| Module | Topic | Duration |
|--------|-------|----------|
| 1 | Introduction & Setup | 30 min |
| 2 | Core Fundamentals | 45 min |
| 3 | Data Structures | 60 min |
| 4 | Advanced Patterns | 45 min |
| 5 | Real-World Project | 90 min |
| 6 | Best Practices | 30 min |

> **Note:** Each module builds on the previous one. Complete them in order for the best learning experience.

## Summary

By the end of this module, you should have a working development environment and a clear understanding of what ${topic} is and why it matters.`,
          sources: [
            {
              title: `Official ${topic} Documentation`,
              url: "https://docs.example.com/getting-started",
            },
            {
              title: `${topic} - Wikipedia`,
              url: "https://en.wikipedia.org/wiki/Programming",
            },
          ],
        },
      },
      {
        id: `${roadmapId}-n2`,
        label: "Core Fundamentals",
        isCompleted: false,
        material: {
          markdownBody: `# Core Fundamentals of ${topic}

Now that your environment is set up, let's dive into the core concepts that form the foundation of ${topic}.

## Variables and Types

Understanding type systems is crucial. Here are the primary types you'll work with:

\`\`\`cpp
// Primitive types
int count = 42;
double price = 19.99;
char grade = 'A';
bool isActive = true;
std::string name = "Cognimosity";

// Constants
const int MAX_SIZE = 100;
constexpr double PI = 3.14159265358979;
\`\`\`

## Control Flow

### Conditional Statements

\`\`\`cpp
if (score >= 90) {
    grade = 'A';
} else if (score >= 80) {
    grade = 'B';
} else if (score >= 70) {
    grade = 'C';
} else {
    grade = 'F';
}
\`\`\`

### Loops

\`\`\`cpp
// Range-based for loop (modern approach)
for (const auto& item : collection) {
    process(item);
}

// Traditional for loop
for (int i = 0; i < n; ++i) {
    compute(i);
}
\`\`\`

## Functions

Functions are the building blocks of any program:

\`\`\`cpp
// Function with return type and parameters
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Function overloading
double area(double radius) {
    return PI * radius * radius;
}

double area(double width, double height) {
    return width * height;
}
\`\`\`

## Practice Exercises

1. Write a function that reverses a string
2. Implement a basic calculator with +, -, *, /
3. Create a program that finds prime numbers up to N

> **Tip:** Try solving each exercise before looking at the solutions. Struggle is where real learning happens.`,
          sources: [
            {
              title: "Core Language Reference",
              url: "https://en.cppreference.com/w/",
            },
            {
              title: "Interactive Tutorials",
              url: "https://www.learncpp.com/",
            },
          ],
        },
      },
      {
        id: `${roadmapId}-n3`,
        label: "Data Structures",
        isCompleted: false,
        material: {
          markdownBody: `# Data Structures in ${topic}

Understanding data structures is essential for writing efficient code. This module covers the most important ones.

## Arrays and Vectors

\`\`\`cpp
#include <vector>
#include <array>

// Fixed-size array
std::array<int, 5> fixed = {1, 2, 3, 4, 5};

// Dynamic array (vector)
std::vector<int> dynamic = {10, 20, 30};
dynamic.push_back(40);
dynamic.emplace_back(50);

// Access elements
int first = dynamic[0];      // No bounds checking
int safe = dynamic.at(0);     // With bounds checking
\`\`\`

## Maps and Sets

\`\`\`cpp
#include <map>
#include <unordered_map>
#include <set>

// Ordered map (red-black tree)
std::map<std::string, int> ages;
ages["Alice"] = 30;
ages["Bob"] = 25;

// Hash map (O(1) average lookup)
std::unordered_map<std::string, int> scores;
scores.insert({"player1", 100});

// Set (unique elements)
std::set<int> uniqueNumbers = {3, 1, 4, 1, 5};
// uniqueNumbers contains: {1, 3, 4, 5}
\`\`\`

## Complexity Comparison

| Data Structure | Insert | Lookup | Delete | Ordered? |
|---------------|--------|--------|--------|----------|
| vector | O(1)* | O(1) | O(n) | Yes |
| list | O(1) | O(n) | O(1) | Yes |
| map | O(log n) | O(log n) | O(log n) | Yes |
| unordered_map | O(1)* | O(1)* | O(1)* | No |
| set | O(log n) | O(log n) | O(log n) | Yes |

*\\*Amortized*

## Choosing the Right Structure

- Need fast random access? → **vector**
- Need fast insertion/deletion in the middle? → **list**
- Need key-value pairs with ordering? → **map**
- Need fastest key-value lookups? → **unordered_map**
- Need unique sorted elements? → **set**`,
          sources: [
            {
              title: "STL Containers Reference",
              url: "https://en.cppreference.com/w/cpp/container",
            },
            {
              title: "Data Structures Visualized",
              url: "https://visualgo.net/en",
            },
          ],
        },
      },
      {
        id: `${roadmapId}-n4`,
        label: "Advanced Patterns",
        isCompleted: false,
        material: {
          markdownBody: `# Advanced Patterns in ${topic}

Now that you have a solid foundation, let's explore patterns that professional developers use daily.

## Object-Oriented Design

\`\`\`cpp
class Shape {
public:
    virtual ~Shape() = default;
    virtual double area() const = 0;
    virtual std::string name() const = 0;
};

class Circle : public Shape {
    double radius_;
public:
    explicit Circle(double r) : radius_(r) {}
    double area() const override {
        return 3.14159 * radius_ * radius_;
    }
    std::string name() const override {
        return "Circle";
    }
};

class Rectangle : public Shape {
    double width_, height_;
public:
    Rectangle(double w, double h) : width_(w), height_(h) {}
    double area() const override {
        return width_ * height_;
    }
    std::string name() const override {
        return "Rectangle";
    }
};
\`\`\`

## Smart Pointers

\`\`\`cpp
#include <memory>

// Unique ownership
auto widget = std::make_unique<Widget>("premium");

// Shared ownership
auto shared = std::make_shared<Resource>();
auto copy = shared; // Reference count: 2

// Weak reference (no ownership)
std::weak_ptr<Resource> weak = shared;
if (auto locked = weak.lock()) {
    locked->use();
}
\`\`\`

## Templates and Generic Programming

\`\`\`cpp
template<typename T>
T findMax(const std::vector<T>& items) {
    if (items.empty()) {
        throw std::invalid_argument("Empty vector");
    }
    T maxVal = items[0];
    for (const auto& item : items) {
        if (item > maxVal) maxVal = item;
    }
    return maxVal;
}

// Usage
auto maxInt = findMax<int>({3, 1, 4, 1, 5});
auto maxStr = findMax<std::string>({"apple", "cherry", "banana"});
\`\`\`

## The RAII Pattern

RAII (Resource Acquisition Is Initialization) is perhaps the most important pattern:

> Resources are tied to object lifetimes. When the object is destroyed, the resource is released. This eliminates an entire class of bugs related to resource leaks.

\`\`\`cpp
class FileHandle {
    FILE* file_;
public:
    explicit FileHandle(const char* path)
        : file_(fopen(path, "r")) {
        if (!file_) throw std::runtime_error("Cannot open file");
    }
    ~FileHandle() { if (file_) fclose(file_); }
    
    // Delete copy, allow move
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
    FileHandle(FileHandle&& other) noexcept
        : file_(other.file_) { other.file_ = nullptr; }
};
\`\`\``,
          sources: [
            {
              title: "C++ Core Guidelines",
              url: "https://isocpp.github.io/CppCoreGuidelines/",
            },
            {
              title: "Design Patterns in Modern C++",
              url: "https://refactoring.guru/design-patterns",
            },
            {
              title: "Effective Modern C++ (Book)",
              url: "https://www.oreilly.com/library/view/effective-modern-c/9781491908419/",
            },
          ],
        },
      },
      {
        id: `${roadmapId}-n5`,
        label: "Real-World Project",
        isCompleted: false,
        material: {
          markdownBody: `# Build a Real-World Project

Time to apply everything you've learned! In this module, we'll build a **Task Manager CLI Application**.

## Project Architecture

\`\`\`
task-manager/
├── include/
│   ├── task.h
│   ├── storage.h
│   └── cli.h
├── src/
│   ├── main.cpp
│   ├── task.cpp
│   ├── storage.cpp
│   └── cli.cpp
├── tests/
│   └── test_task.cpp
├── CMakeLists.txt
└── README.md
\`\`\`

## Step 1: Define the Data Model

\`\`\`cpp
// include/task.h
#pragma once
#include <string>
#include <chrono>

enum class Priority { Low, Medium, High, Critical };

struct Task {
    int id;
    std::string title;
    std::string description;
    Priority priority;
    bool completed;
    std::chrono::system_clock::time_point createdAt;
    
    std::string priorityString() const;
    std::string statusString() const;
};
\`\`\`

## Step 2: Implement Storage

\`\`\`cpp
// include/storage.h
#pragma once
#include "task.h"
#include <vector>
#include <optional>

class TaskStorage {
    std::vector<Task> tasks_;
    int nextId_ = 1;
    std::string filePath_;
    
public:
    explicit TaskStorage(const std::string& path);
    
    Task& addTask(const std::string& title, Priority p);
    bool removeTask(int id);
    std::optional<Task*> findTask(int id);
    std::vector<Task> getAllTasks() const;
    std::vector<Task> getByPriority(Priority p) const;
    
    void saveToFile() const;
    void loadFromFile();
};
\`\`\`

## Step 3: Build the CLI

\`\`\`cpp
// Main entry point
int main(int argc, char* argv[]) {
    TaskStorage storage("tasks.json");
    storage.loadFromFile();
    
    CLI cli(storage);
    cli.run();
    
    return 0;
}
\`\`\`

## Build System

\`\`\`cmake
cmake_minimum_required(VERSION 3.20)
project(TaskManager VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(taskmanager
    src/main.cpp
    src/task.cpp
    src/storage.cpp
    src/cli.cpp
)

target_include_directories(taskmanager PRIVATE include)
\`\`\`

## Challenge Extensions

Once the basic app works, try adding:

1. **Due dates** with reminders
2. **Tags** for categorization
3. **Search** by title or description
4. **Export** to CSV format
5. **Statistics** (completion rate, overdue tasks)`,
          sources: [
            {
              title: "CMake Tutorial",
              url: "https://cmake.org/cmake/help/latest/guide/tutorial/",
            },
            {
              title: "JSON for Modern C++",
              url: "https://github.com/nlohmann/json",
            },
          ],
        },
      },
      {
        id: `${roadmapId}-n6`,
        label: "Best Practices & Next Steps",
        isCompleted: false,
        material: {
          markdownBody: `# Best Practices & Next Steps

Congratulations on making it this far! This final module covers the practices that separate good developers from great ones.

## Code Quality Guidelines

### 1. Follow the Rule of Five

\`\`\`cpp
class Resource {
public:
    Resource();                              // Constructor
    ~Resource();                             // Destructor
    Resource(const Resource&);              // Copy constructor
    Resource& operator=(const Resource&);   // Copy assignment
    Resource(Resource&&) noexcept;          // Move constructor
    Resource& operator=(Resource&&) noexcept; // Move assignment
};
\`\`\`

### 2. Use \`const\` Everywhere Possible

\`\`\`cpp
// Good: clearly communicates intent
const std::string& getName() const { return name_; }
void process(const std::vector<int>& data);
\`\`\`

### 3. Prefer Algorithms to Raw Loops

\`\`\`cpp
#include <algorithm>
#include <numeric>

// Instead of manual loops:
auto sum = std::accumulate(v.begin(), v.end(), 0);
auto it = std::find_if(v.begin(), v.end(),
    [](int x) { return x > 10; });
std::sort(v.begin(), v.end(), std::greater<>{});
\`\`\`

## Testing Best Practices

\`\`\`cpp
// Use a testing framework like GoogleTest
#include <gtest/gtest.h>

TEST(TaskTest, CreateTask) {
    Task t{1, "Test", "Description",
           Priority::High, false, Clock::now()};
    EXPECT_EQ(t.id, 1);
    EXPECT_EQ(t.title, "Test");
    EXPECT_FALSE(t.completed);
}

TEST(TaskTest, MarkComplete) {
    Task t{1, "Test", "", Priority::Low, false, Clock::now()};
    t.completed = true;
    EXPECT_TRUE(t.completed);
}
\`\`\`

## Performance Tips

| Practice | Impact | Effort |
|----------|--------|--------|
| Use \`reserve()\` for vectors | High | Low |
| Pass large objects by const ref | Medium | Low |
| Use move semantics | High | Medium |
| Profile before optimizing | Critical | Medium |
| Cache-friendly data layouts | High | High |

## Recommended Learning Path

After completing this roadmap, here's where to go next:

1. **Concurrency** — \`std::thread\`, \`std::async\`, \`std::mutex\`
2. **Networking** — Boost.Asio or standalone ASIO
3. **Graphics** — OpenGL, Vulkan, or SDL2
4. **Web Services** — REST APIs with cpp-httplib
5. **Embedded Systems** — Arduino, Raspberry Pi

## Final Thoughts

> "The only way to learn a new programming language is by writing programs in it." — Dennis Ritchie

Remember: **consistency beats intensity**. Write code every day, read other people's code, and never stop being curious.

Happy coding! 🚀`,
          sources: [
            {
              title: "C++ Core Guidelines",
              url: "https://isocpp.github.io/CppCoreGuidelines/",
            },
            {
              title: "GoogleTest Documentation",
              url: "https://google.github.io/googletest/",
            },
            {
              title: "Awesome C++ Resources",
              url: "https://github.com/fffaraz/awesome-cpp",
            },
          ],
        },
      },
    ],
  };
}
