from flask import Blueprint, jsonify

lessons_bp = Blueprint('lessons', __name__)

curriculum = {
    "white_belt": {
        "title": "White Belt - Introduction to Python",
        "description": "Learn the basics of Python programming",
        "lessons": [
            {
                "day": 1,
                "title": "Hello World and Multi-line Printing",
                "content": "Learn how to print text in Python using the print() function. We'll explore both single-line and multi-line printing techniques.",
                "exercise": '''# Print a simple greeting
print("Hello world!")

# Print a multi-line message
print("""HELLO
WORLD
WHATs
UP""")

# Your challenge: Create a personal coding pledge
print("""I am signing up for the Python challenge!
I will make sure to spend some time every day coding along.
I'm feeling 
Let's start this journey!""")''',
                "expected_output_contains": "Hello world!",
                "hint": "Remember to use the correct number of quotation marks for multi-line strings!"
            },
            {
                "day": 2,
                "title": "User Input and Basic Output",
                "content": "Learn how to get input from users and create interactive programs using the input() function.",
                "exercise": '''# Let's create a simple introduction program
MyName = input("Name: ")
MyAge = input("Age: ")
print("Nice to meet you!")
print()  # This prints an empty line
print("So, you are")
print(MyName)
print("and you are")
print(MyAge)
print("years old.")''',
                "expected_output_contains": "Nice to meet you!",
                "hint": "Remember to store user input in variables using the input() function."
            },
            {
                "day": 3,
                "title": "String Concatenation",
                "content": "Learn how to combine strings and variables in print statements using commas and the + operator.",
                "exercise": '''# Create a lunch planning program
myName = input("What's your name? ")
myLunch = input("What are you having for lunch? ")
print(myName, "is going to be chowing down on", myLunch, "very soon!")''',
                "expected_output_contains": "is going to be chowing down on",
                "hint": "Use commas to separate items in your print statement for automatic spacing."
            },
            {
                "day": 4,
                "title": "Adventure Story Generator",
                "content": "Create an interactive story generator using multiple input statements and string concatenation.",
                "exercise": '''print("YOUR ADVENTURE SIMULATOR")

name = input("What is your name?: ")
enemy = input("What is your enemy's name?: ")
power = input("What is your super power?: ")

print()
print("It was a cold winter day.", name, "were walking down the street when", name, "saw", enemy, 
      "standing in the middle of the road.", name, "was know, the", enemy, 
      "is planing the attack. So", name, "use", name + "'s secret power;", power)''',
                "expected_output_contains": "YOUR ADVENTURE SIMULATOR",
                "hint": "Remember to use commas to separate strings and variables in your print statement."
            },
            {
                "day": 5,
                "title": "Basic Conditional Statements",
                "content": "Learn how to make decisions in your code using if, elif, and else statements.",
                "exercise": '''print("Which character are you?")

favorite_color = input("What is your favorite color? ")
if favorite_color == "red":
    print("You are Celestia.")
elif favorite_color == "blue":
    print("You are Eve.")
elif favorite_color == "green":
    print("You are Gilgamesh.")
elif favorite_color == "yellow":
    print("You are Hermes.")
elif favorite_color == "orange":
    print("You are Isis.")
else:
    print("Have no idea.")''',
                "expected_output_contains": "Which character are you?",
                "hint": "Make sure to use double equals (==) for comparison and proper indentation after if/elif/else statements."
            },
            {
                "day": 6,
                "title": "Login System with Multiple Conditions",
                "content": "Learn how to combine conditions using 'and' operator to create a simple login system.",
                "exercise": '''print("SECURE LOGIN")
username = input("Username > ")
password = input("Password > ")

if username == "mark" and password == "password":
    print("Welcome Mark!")
elif username == "irem" and password == "iremirem":
    print("Welcome master!")
else:
    print("Go away!")''',
                "expected_output_contains": "SECURE LOGIN",
                "hint": "Use the 'and' operator to check both username and password match exactly."
            },
            {
                "day": 7,
                "title": "Ice Cream Shop",
                "content": "Create an ice cream shop program that asks customers for their flavor choice and toppings preference.",
                "exercise": '''print("Welcome to the Ice Cream Shop!")
flavor = input("What flavor would you like (vanilla/chocolate)? ").lower()

if flavor == "vanilla":
    print("Great choice! Vanilla is our specialty.")
    topping = input("Would you like sprinkles on top (yes/no)? ").lower()
    if topping == "yes":
        print("Adding colorful sprinkles to your vanilla ice cream!")
    else:
        print("Here's your vanilla ice cream, nice and simple!")
elif flavor == "chocolate":
    print("Excellent! Our chocolate is imported from Belgium.")
    topping = input("Would you like whipped cream on top (yes/no)? ").lower()
    if topping == "yes":
        print("Adding a swirl of whipped cream to your chocolate ice cream!")
    else:
        print("Here's your chocolate ice cream, pure and delicious!")
else:
    print("Sorry, we only have vanilla and chocolate today.")''',
                "expected_output_contains": "Welcome to the Ice Cream Shop!",
                "hint": "Remember to use .lower() to handle any capitalization in the input."
            },
            {
                "day": 8,
                "title": "Complex Conditions with Multiple Variables",
                "content": "Learn to combine multiple conditions and variables to create personalized messages.",
                "exercise": '''name = input("What is your name? ")
age = input("How old are you? ")
job = input("What is your dream job? ")
hope = input("You think you can achieve this? Rate 1-10 ")

if int(age) <= 20 and int(hope) > 5:
    print("Hi", name, "! It's nice to see you. I know, you wanna be a", job, 
          "and with this confident, I'm pretty sure that you can. Don't Give Up!")
elif int(age) > 20 and int(hope) > 5:
    print("Hi", name, "! It's nice to see you. I know, you wanna be a", job,
          " You know that it's never too late! You can be whatever you want!")
elif int(age) <= 20 and int(hope) < 5:
    print("Hi", name, "! It's nice to see you. I know, you wanna be a", job,
          " You are so young! Why are you so hopeless? You can be whatever you want! Just do it!")
else:
    print("Hi", name, "! It's nice to see you. I know, you wanna be a", job,
          "and I know, you are hopeless but want you to know, it's not too late. You can be whatever you want! Just keep pushing!")''',
                "expected_output_contains": "Hi",
                "hint": "Remember to convert string inputs to integers using int() for numerical comparisons."
            },
            {
                "day": 9,
                "title": "Working with Numbers and Comparisons",
                "content": "Learn how to work with integers, floating-point numbers, and numerical comparisons.",
                "exercise": '''birthyear = int(input("Enter your birth year: "))

if 1925 < birthyear < 1946:
    print("You are a Traditionalist")
elif 1947 < birthyear < 1964:
    print("You are a Baby Boomer")
elif 1965 < birthyear < 1981:
    print("You are a Generation X")
elif 1982 < birthyear < 1995:
    print("You are a Millennial")
elif 1995 < birthyear < 2011:
    print("You are a Generation Z")
else:
    print("You are a Generation Alpha")''',
                "expected_output_contains": "You are",
                "hint": "Make sure to convert the input to an integer using int() before making comparisons."
            },
            {
                "day": 10,
                "title": "Bill Calculator",
                "content": """Welcome to Day 10! Today we'll create a bill calculator that helps people split restaurant bills.

Your task is to create a program that:
1. Asks for the total bill amount
2. Asks for the tip percentage (15%, 18%, or 20%)
3. Asks for the number of people splitting the bill
4. Calculates and displays:
   - The tip amount
   - The total bill including tip
   - How much each person should pay

Remember to:
- Convert the tip percentage to a decimal (e.g., 15% = 0.15)
- Round the results to 2 decimal places
- Display the amounts with a dollar sign ($)
""",
                "exercise": """# Bill Calculator
# Get the bill amount, tip percentage, and number of people
bill = float(input("Enter the bill amount: $"))
tip_percent = float(input("Enter tip percentage (15, 18, or 20): "))
people = int(input("Enter number of people splitting the bill: "))

# Your code here:
""",
                "expected_output_contains": ["tip amount", "total", "each person"],
                "test_inputs": ["50.00", "15", "2"]
            },
            {
                "day": 10.5,
                "title": "White Belt Final Project",
                "content": """Congratulations on completing the White Belt curriculum! Now it's time for your final project.

Your task is to create a comprehensive program that demonstrates your mastery of White Belt concepts:

Create an Ice Cream Shop Calculator that:
1. Displays a menu of ice cream flavors with prices
2. Allows customers to order multiple scoops
3. Applies discounts based on the number of scoops:
   - 3+ scoops: 10% off
   - 5+ scoops: 15% off
4. Calculates the final price including tax (8%)

Requirements:
- Use input/output operations
- Implement if/else statements for discounts
- Perform calculations for discounts and tax
- Format the output nicely with dollar signs
- Include error handling for invalid inputs

Show us what you've learned! Good luck! 🍦
""",
                "exercise": """# Ice Cream Shop Calculator
# Menu:
# Vanilla: $3.00
# Chocolate: $3.00
# Strawberry: $3.25
# Mint Chip: $3.25
# Cookie Dough: $3.50

# Your code here:
""",
                "expected_output_contains": ["total", "discount", "tax", "final"],
                "test_inputs": ["vanilla", "2", "chocolate", "2", "done"]
            }
        ]
    },
    "yellow_belt": {
        "title": "Yellow Belt - Advanced Concepts",
        "description": "Master advanced Python programming concepts",
        "lessons": [
            {
                "day": 11,
                "title": "Time Calculations",
                "content": """Welcome to Yellow Belt! Let's start with time-based calculations.

Your task is to create a program that:
1. Asks if it's a leap year
2. Calculates:
   - Seconds in a day
   - Seconds in a week
   - Seconds in the year (accounting for leap year)
3. Displays all calculations clearly

Remember to:
- Use clear variable names
- Add helpful comments
- Format output nicely
""",
                "exercise": """# Time Calculator
is_leap_year = input("Is this a leap year? (yes/no): ").lower()

# Calculate seconds in a day
seconds_per_minute = 60
minutes_per_hour = 60
hours_per_day = 24

# Calculate seconds in a day
seconds_per_day = seconds_per_minute * minutes_per_hour * hours_per_day
print(f"Seconds in a day: {seconds_per_day:,}")

# Calculate seconds in a week
days_per_week = 7
seconds_per_week = seconds_per_day * days_per_week
print(f"Seconds in a week: {seconds_per_week:,}")

# Calculate seconds in a year
days_per_year = 366 if is_leap_year == "yes" else 365
seconds_per_year = seconds_per_day * days_per_year
print(f"Seconds in a year: {seconds_per_year:,}")
""",
                "expected_output": """Is this a leap year? (yes/no): yes
Seconds in a day: 86,400
Seconds in a week: 604,800
Seconds in a year: 31,622,400""",
                "test_inputs": ["yes"]
            },
            {
                "day": 12,
                "title": "Number Pattern Generator",
                "content": """Create a program that generates different number patterns:
1. Counting up pattern (1, 2, 3, 4, 5)
2. Counting down pattern (5, 4, 3, 2, 1)
3. Skip counting pattern (2, 4, 6, 8, 10)
4. Alternating pattern (1, -1, 2, -2, 3, -3)

Let the user choose which pattern to display!""",
                "exercise": """# Number Pattern Generator
print("Choose a pattern:")
print("1: Count Up")
print("2: Count Down")
print("3: Skip Counting")
print("4: Alternating")

choice = input("Enter pattern number (1-4): ")

# Your code here:
""",
                "expected_output_contains": ["pattern", "Enter pattern"],
                "test_inputs": ["1"]
            },
            {
                "day": 13,
                "title": "Adventure Game",
                "content": """Create a text-based adventure game where the player makes choices:
1. Start in a mysterious room
2. Offer multiple paths (door, window, trap door)
3. Each choice leads to different outcomes
4. Include at least one treasure and one trap
5. Keep track of player's health/score""",
                "exercise": """# Adventure Game
print("Welcome to the Mystery Room!")
print("You find yourself in a dimly lit room...")
print("\\nChoose your path:")
print("1: Try the creaky door")
print("2: Climb through the window")
print("3: Open the trap door")

# Your code here:
""",
                "expected_output_contains": ["Welcome", "Choose"],
                "test_inputs": ["1"]
            },
            {
                "day": 14,
                "title": "Password Generator",
                "content": """Create a secure password generator that:
1. Asks for desired password length
2. Includes a mix of:
   - Uppercase letters
   - Lowercase letters
   - Numbers
   - Special characters
3. Ensures at least one of each type
4. Lets user generate multiple passwords""",
                "exercise": """# Password Generator
import random
import string

length = int(input("How long should the password be? (minimum 8): "))

# Available characters
lowercase = string.ascii_lowercase
uppercase = string.ascii_uppercase
numbers = string.digits
symbols = "!@#$%^&*"

# Your code here:
""",
                "expected_output_contains": ["password"],
                "test_inputs": ["12"]
            },
            {
                "day": 15,
                "title": "Word Game",
                "content": """Create a word guessing game that:
1. Has a list of words in different categories
2. Lets player choose a category
3. Shows blanks for each letter
4. Tracks wrong guesses
5. Has a maximum of 6 wrong guesses allowed""",
                "exercise": """# Word Game
categories = {
    "animals": ["elephant", "giraffe", "penguin"],
    "fruits": ["banana", "orange", "mango"],
    "countries": ["japan", "brazil", "egypt"]
}

print("Choose a category:")
for category in categories:
    print("-", category)

# Your code here:
""",
                "expected_output_contains": ["category", "Choose"],
                "test_inputs": ["animals"]
            },
            {
                "day": 16,
                "title": "Calculator App",
                "content": """Create a calculator that can:
1. Perform basic operations (+, -, *, /)
2. Include special operations (power, square root)
3. Keep history of calculations
4. Allow user to recall previous results""",
                "exercise": """# Calculator App
print("Calculator Menu:")
print("1: Add")
print("2: Subtract")
print("3: Multiply")
print("4: Divide")
print("5: Power")
print("6: Square Root")
print("7: History")

history = []

# Your code here:
""",
                "expected_output_contains": ["Calculator Menu"],
                "test_inputs": ["1", "5", "3"]
            },
            {
                "day": 17,
                "title": "Shopping List Manager",
                "content": """Create a shopping list program that can:
1. Add items with quantities
2. Remove items
3. Update quantities
4. Show total items
5. Save list to a file""",
                "exercise": """# Shopping List Manager
shopping_list = {}

while True:
    print("\\nShopping List Menu:")
    print("1: Add Item")
    print("2: Remove Item")
    print("3: Update Quantity")
    print("4: Show List")
    print("5: Exit")
    
    choice = input("Choose an option: ")

    # Your code here:
""",
                "expected_output_contains": ["Shopping List Menu"],
                "test_inputs": ["1", "apples", "3", "5"]
            },
            {
                "day": 18,
                "title": "Temperature Converter",
                "content": """Create a temperature conversion tool that:
1. Converts between Celsius and Fahrenheit
2. Converts between Celsius and Kelvin
3. Shows conversion formula
4. Handles multiple conversions
5. Validates input ranges""",
                "exercise": """# Temperature Converter
print("Temperature Converter")
print("1: Celsius to Fahrenheit")
print("2: Fahrenheit to Celsius")
print("3: Celsius to Kelvin")
print("4: Kelvin to Celsius")

choice = input("Choose conversion type: ")
temp = float(input("Enter temperature: "))

# Your code here:
""",
                "expected_output_contains": ["Temperature Converter"],
                "test_inputs": ["1", "25"]
            },
            {
                "day": 19,
                "title": "Quiz Game Pro",
                "content": """Create an advanced quiz game that:
1. Has multiple categories
2. Tracks high scores
3. Shows progress
4. Includes timer
5. Gives hints on wrong answers""",
                "exercise": """# Quiz Game Pro
import time

questions = {
    "Python": [
        {"q": "What function prints to the screen?", "a": "print"},
        {"q": "What type is 42?", "a": "int"},
        {"q": "What keyword starts a loop?", "a": "for"}
    ],
    "Geography": [
        {"q": "What is the capital of Japan?", "a": "tokyo"},
        {"q": "Which ocean is the largest?", "a": "pacific"},
        {"q": "What is the longest river?", "a": "nile"}
    ]
}

# Your code here:
""",
                "expected_output_contains": ["Quiz"],
                "test_inputs": ["Python", "print"]
            },
            {
                "day": 20,
                "title": "File Organizer",
                "content": """Create a file organization program that:
1. Lists files in a directory
2. Organizes by file type
3. Renames files systematically
4. Shows file sizes
5. Creates organized folders""",
                "exercise": """# File Organizer
import os
from datetime import datetime

def list_files(directory):
    files = []
    for filename in os.listdir(directory):
        if os.path.isfile(os.path.join(directory, filename)):
            files.append(filename)
    return files

# Test directory
test_dir = "test_files"
if not os.path.exists(test_dir):
    os.makedirs(test_dir)

# Your code here:
""",
                "expected_output_contains": ["files"],
                "test_inputs": ["test_files"]
            }
        ]
    },
    "orange_belt": {
        "title": "Orange Belt - Advanced Python Programming",
        "description": "Master advanced Python concepts and build real applications",
        "lessons": [
            {
                "day": 21,
                "title": "Multiplication Practice Game",
                "content": "Create an interactive multiplication practice game that tests your knowledge of the 7 times table.",
                "exercise": '''counter = 0

for i in range(11):
    answer = input(str(i) + " x 7 = ")
    correct_answer = i*7
    if answer == str(i * 7):
        print("Correct!")
        counter += 1
    else:
        print("That's not correct. It should have been",correct_answer)
        continue

print("You got " + str(counter) + " out of 10 questions correct.")''',
                "expected_output_contains": "Correct!",
                "hint": "Remember to convert the user's input to a string when comparing with the correct answer."
            },
            {
                "day": 22,
                "title": "Random Number Guessing Game",
                "content": "Create an exciting number guessing game using the random library.",
                "exercise": '''import random

print("Totally Random One-Million-to-One")

correct_number = random.randint(1, 1000000)
attempt = 1 

while True:
    user_guess = int(input("Pick a number between 1 and 1,000,000: "))

    if user_guess < 0:
        print("Now we'll never know what the answer is …")
        exit()
    elif user_guess < correct_number:
        print("That number is too low. Try again!")
        attempt += 1
    elif user_guess > correct_number:
        print("That number is too high. Try again!")
        attempt += 1
    elif user_guess == correct_number:
        print("You are a winner! 🥳🥳")
        print("It took you", attempt, "attempt(s) to get the correct answer.")
        break
    else:
        print("That is not a number I recognize.")''',
                "expected_output_contains": "Totally Random One-Million-to-One",
                "hint": "Make sure to handle all possible user inputs, including non-numbers."
            },
            {
                "day": 23,
                "title": "Functions with Loops",
                "content": "Learn how to create and use functions with loops to create reusable code blocks.",
                "exercise": '''def rollDice():
    import random
    dice = random.randint(1,6)
    print("you rolled", dice)

for i in range(10):
    rollDice()''',
                "expected_output_contains": "you rolled",
                "hint": "Functions should be defined before they are called in the code."
            },
            {
                "day": 24,
                "title": "Functions with Multiple Parameters",
                "content": "Learn how to create functions that accept multiple parameters to make your code more flexible.",
                "exercise": '''def whichCake(ingredient, base, coating):
    if ingredient == "chocolate":
        print("Mmm, chocolate cake is amazing")
    elif ingredient == "broccoli":
        print("You what mate?!")
    else: 
        print("Yeah, that's great I suppose...")
    print("So you want a", ingredient, "cake on a", base, "base with", coating, "on top?")
    
userIngredient = input("Name an ingredient: ")
userBase = input("Name a type of base: ")
userCoating = input("Fave cake topping: ")

whichCake(userIngredient, userBase, userCoating)''',
                "expected_output_contains": "So you want a",
                "hint": "Make sure to pass all required parameters to the function in the correct order."
            },
            {
                "day": 25,
                "title": "Return Values from Functions",
                "content": "Learn how to create functions that return values for use in other parts of your code.",
                "exercise": '''def pinPicker(number):
    import random
    pin = ""
    for i in range(number):
        pin += str(random.randint(0,9))
    return pin

myPin = pinPicker(4)
print("Your PIN is:", myPin)
print("Keep it secret!")''',
                "expected_output_contains": "Your PIN is:",
                "hint": "The return statement sends a value back to the caller of the function."
            },
            {
                "day": 26,
                "title": "File Operations & Audio Player",
                "content": """Welcome to Day 26! Today we'll create a simple audio player application.

Your task is to create a program that:
1. Creates a menu-driven audio player
2. Allows playing and stopping audio
3. Uses functions for organization
4. Implements a clean user interface

Key concepts:
- File operations
- Audio playback
- User input handling
- Menu systems
""",
                "exercise": '''import os, time
from replit import audio

def play():
  source = audio.play_file('audio.wav')
  source.paused = False  # unpause the playback
  while True:
    stop_playback = int(input("Press 2 anytime to stop playback and go back to the menu : "))
    if stop_playback == 2:
      source.paused = True
      return
    else: 
      continue

while True:
  os.system("clear")
  print("🎵 MyPOD Music Player ")
  time.sleep(1)
  print("Press 1 to Play")
  time.sleep(1)
  print("Press 2 to Exit")
  time.sleep(1)
  print("Press anything else to see the menu again")
  userInput = int(input())
  if userInput == 1:
    print("Playing some proper tunes!")
    play()
  elif userInput == 2:
    exit()
  else:
    continue''',
                "expected_output_contains": ["MyPOD Music Player", "Press 1 to Play", "Press 2 to Exit"],
                "hint": "Remember to handle user input carefully and provide clear menu options."
            },
            {
                "day": 27,
                "title": "RPG Character Creator",
                "content": """Welcome to Day 27! Today we'll create a character creator for an RPG game.

Your task is to create a program that:
1. Takes character name and type as input
2. Generates random health and strength stats
3. Uses dice rolling mechanics
4. Displays character information

Key concepts:
- Random number generation
- Functions with parameters
- Basic game mechanics
- User input handling
""",
                "exercise": '''import random, time, os

def roll_dice(dice1, dice2):
  health = (dice1 * dice2 / 2) + 10
  return health

def roll_dice2(dice11, dice22):
  strength = (dice11 * dice22 / 2) + 12
  return strength

name = input("What is your character name? ")
type = input("What is your character type? ")

os.system("clear")
time.sleep(1)

health = roll_dice(random.randint(1,6), random.randint(1,12))
print(f"{name}'s health is {health}ph")

strength = roll_dice2(random.randint(1,6), random.randint(1,12))
print(f"{name}'s strength is {strength}ph")''',
                "expected_output_contains": ["health is", "strength is"],
                "hint": "Use functions to organize your code and make the dice rolling reusable."
            },
            {
                "day": 28,
                "title": "Battle System",
                "content": """Welcome to Day 28! Today we'll create a complete battle system for our RPG game.

Your task is to create a program that:
1. Creates two characters with stats
2. Implements a turn-based battle system
3. Uses dice rolls for combat
4. Tracks health and determines a winner

Key concepts:
- Complex game logic
- Multiple character management
- Round-based systems
- Status tracking
""",
                "exercise": '''import random, os, time

def rollDice(side):
    result = random.randint(1, side)
    return result

def health():
    healthStat = ((rollDice(6) * rollDice(12)) / 2) + 10
    return healthStat

def strength():
    strengthStat = ((rollDice(6) * rollDice(8)) / 2) + 12
    return strengthStat

print("⚔️ CHARACTER BUILDER ⚔️")
print()

name1 = input("Name your Legend:\\n")
type1 = input("Character Type (Human, Elf, Wizard, Orc):\\n")

name2 = input("Name your Legend:\\n")
type2 = input("Character Type (Human, Elf, Wizard, Orc):\\n")

health1 = health()
strength1 = strength()
health2 = health()
strength2 = strength()

print()
print(name1)
print("HEALTH:", health1)
print("STRENGTH:", strength1)
print()
print(name2)
print("HEALTH:", health2)
print("STRENGTH:", strength2)
print()

round = 1
winner = None

while True:
    time.sleep(1)
    os.system("clear")
    dice1 = rollDice(6)
    dice2 = rollDice(6)
    difference = abs(strength1 - strength2) + 1

    if dice1 > dice2:
        health2 -= difference
        if round == 1:
            print(name1, "wins the first blow")
        else:
            print(name1, "wins round", round)
    elif dice2 > dice1:
        health1 -= difference
        if round == 1:
            print(name2, "wins the first blow")
        else:
            print(name2, "wins round", round)
    else:
        print("Their swords clash and they draw round", round)

    print()
    print(name1)
    print("HEALTH:", health1)
    print()
    print(name2)
    print("HEALTH:", health2)
    print()

    if health1 <= 0:
        print(name1, "has died!")
        winner = name2
        break
    elif health2 <= 0:
        print(name2, "has died!")
        winner = name1
        break
    else:
        print("And they're both standing for the next round")
        round += 1

print(winner, "has won in", round, "rounds")''',
                "expected_output_contains": ["CHARACTER BUILDER", "HEALTH:", "STRENGTH:", "has won in"],
                "hint": "Break down the battle system into smaller functions to make it more manageable."
            },
            {
                "day": 29,
                "title": "Advanced Print Formatting",
                "content": """Welcome to Day 29! Today we'll learn advanced print formatting and color output.

Your task is to create a program that:
1. Uses ANSI color codes
2. Creates custom print functions
3. Implements different text styles
4. Makes colorful, animated output

Key concepts:
- ANSI escape codes
- Custom functions
- Text formatting
- Animation basics
""",
                "exercise": '''def newPrint(color, word):
    if color == "red":
        print("\\033[0;31m", word, sep="", end="")
    elif color == "blue":
        print("\\033[0;34m", word, sep="", end="")
    else:
        print(word, sep="", end="")

print("Super Subroutine")
print("With my ", end="")
newPrint("red", "new program")
newPrint("reset", " I can just call red('and') ")
newPrint("red", "it will print in red ")
newPrint("blue", "or even blue")

# Animation example
import os, time
print('\\033[?25l', end="")
for i in range(1, 101):
    print(i)
    time.sleep(0.1)
    os.system("clear")
print('\\033[?25h', end="")''',
                "expected_output_contains": ["Super Subroutine", "new program", "print in red"],
                "hint": "ANSI escape codes can be used to add color and style to your terminal output."
            },
            {
                "day": 30,
                "title": "String Formatting Mastery",
                "content": """Welcome to Day 30! For our final orange belt lesson, we'll master string formatting.

Your task is to create a program that:
1. Uses different string formatting methods
2. Creates formatted output
3. Implements f-strings
4. Handles complex string operations

Key concepts:
- String formatting methods
- F-strings
- Alignment and spacing
- Format specifiers
""",
                "exercise": '''print("30 Days Down - String Formatting Master")

# Basic string formatting
name = "Katie"
age = "28"
pronouns = "she/her"

print("This is {}, using {} pronouns, and is {} years old.".format(name, pronouns, age))

# Named placeholders
print("This is {name}, using {pronouns} pronouns, and is {age} years old. Hello, {name}!".format(
    name=name, pronouns=pronouns, age=age))

# F-strings
response = f"This is {name}, using {pronouns} pronouns, and is {age} years old."
print(response)

# Centered alignment
for i in range(1, 31):
    print(f"Day {i : ^2} of 30")

# Challenge: 30 Days Reflection
print("\\n30 Days Down - Time to Reflect\\n")
i = 1
while i < 31:
    print(f"How was Day {i}?")
    answer = input()
    response = f"Day {i} was {answer}."
    print(f"{response:^35}")
    i += 1
else:
    print("\\nCongratulations! You've completed the Orange Belt!\\n")''',
                "expected_output_contains": ["30 Days Down", "This is Katie", "Day"],
                "hint": "Experiment with different string formatting methods to find the most readable approach."
            }
        ]
    }
}

def get_curriculum():
    return curriculum

@lessons_bp.route('/api/curriculum/<belt>')
def get_belt_curriculum(belt):
    curriculum = get_curriculum()
    if belt in curriculum:
        return jsonify(curriculum[belt])
    return jsonify({"error": "Belt not found"}), 404

@lessons_bp.route('/api/curriculum/<belt>/<int:day>')
def get_lesson(belt, day):
    curriculum = get_curriculum()
    if belt not in curriculum:
        return jsonify({"error": "Belt not found"}), 404
        
    belt_curriculum = curriculum[belt]
    for lesson in belt_curriculum["lessons"]:
        if lesson["day"] == day:
            return jsonify(lesson)
    
    return jsonify({"error": "Lesson not found"}), 404

@lessons_bp.route('/api/curriculum/progress')
def get_curriculum_progress():
    curriculum = get_curriculum()
    total_lessons = sum(len(belt_data["lessons"]) for belt_data in curriculum.values())
    return jsonify({
        "total_lessons": total_lessons,
        "curriculum": curriculum
    })
