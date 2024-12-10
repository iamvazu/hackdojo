import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const ftcLessons = [
  {
    id: 1,
    title: "Introduction to FTC and Java Programming",
    description: "Overview of FTC Hardware and basic Java concepts",
    content: `
      // Basic "Hello World" OpMode
      @TeleOp(name = "Hello World OpMode")
      public class HelloWorldOpMode extends LinearOpMode {
          @Override
          public void runOpMode() {
              telemetry.addData("Status", "Hello FTC World!");
              telemetry.update();
              
              waitForStart();

              while (opModeIsActive()) {
                  telemetry.addData("Status", "Running");
                  telemetry.update();
              }
          }
      }
    `,
    exercises: [
      {
        title: "Personalized Hello World",
        description: "Modify the Hello World program to display your name and team number",
        template: `
          @TeleOp(name = "My First OpMode")
          public class MyFirstOpMode extends LinearOpMode {
              // TODO: Create variables for your name and team number
              
              @Override
              public void runOpMode() {
                  // TODO: Display your personalized message using telemetry
                  
                  waitForStart();
                  
                  while (opModeIsActive()) {
                      // TODO: Update telemetry in the loop
                  }
              }
          }
        `
      }
    ],
    quiz: [
      {
        question: "What is an OpMode in FTC?",
        options: [
          "A type of robot",
          "A program that controls the robot",
          "A hardware component",
          "A type of motor"
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 2,
    title: "Variables and Data Types",
    description: "Learn about variables and data types in Java for FTC",
    content: `
      // Example of different data types in FTC
      public class DataTypesExample extends LinearOpMode {
          // Integer for team number
          private int teamNumber = 12345;
          
          // Double for motor speed
          private double motorSpeed = 0.5;
          
          // Boolean for robot state
          private boolean isMoving = false;
          
          // String for robot name
          private String robotName = "MyRobot";
          
          @Override
          public void runOpMode() {
              telemetry.addData("Team", teamNumber);
              telemetry.addData("Speed", motorSpeed);
              telemetry.addData("Moving", isMoving);
              telemetry.addData("Name", robotName);
              telemetry.update();
              
              waitForStart();
          }
      }
    `,
    exercises: [
      {
        title: "Variable Practice",
        description: "Create and use variables to store robot information",
        template: `
          public class RobotInfo extends LinearOpMode {
              // TODO: Create variables for robot configuration
              // Include: team number, robot name, maximum speed
              
              @Override
              public void runOpMode() {
                  // TODO: Display all robot information using telemetry
              }
          }
        `
      }
    ],
    quiz: [
      {
        question: "Which data type should you use for motor power?",
        options: [
          "int",
          "String",
          "double",
          "boolean"
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 3,
    title: "Gamepad and Basic Math",
    description: "Learn to use gamepad inputs and perform basic calculations",
    content: `
      // Example of gamepad usage
      public class GamepadExample extends LinearOpMode {
          private DcMotor leftDrive;
          private DcMotor rightDrive;
          
          @Override
          public void runOpMode() {
              leftDrive = hardwareMap.get(DcMotor.class, "left_drive");
              rightDrive = hardwareMap.get(DcMotor.class, "right_drive");
              
              waitForStart();
              
              while (opModeIsActive()) {
                  // Get gamepad inputs
                  double drive = -gamepad1.left_stick_y;
                  double turn = gamepad1.right_stick_x;
                  
                  // Calculate motor powers
                  double leftPower = drive + turn;
                  double rightPower = drive - turn;
                  
                  // Set motor powers
                  leftDrive.setPower(leftPower);
                  rightDrive.setPower(rightPower);
                  
                  // Display values
                  telemetry.addData("Left Power", leftPower);
                  telemetry.addData("Right Power", rightPower);
                  telemetry.update();
              }
          }
      }
    `,
    exercises: [
      {
        title: "Gamepad Control",
        description: "Implement basic tank drive using gamepad inputs",
        template: `
          public class TankDrive extends LinearOpMode {
              private DcMotor leftDrive;
              private DcMotor rightDrive;
              
              @Override
              public void runOpMode() {
                  // TODO: Initialize motors
                  
                  waitForStart();
                  
                  while (opModeIsActive()) {
                      // TODO: Implement tank drive control
                  }
              }
          }
        `
      }
    ]
  }
];

export const codeTemplates = {
  basicRobot: `
    public class BasicRobot extends LinearOpMode {
        // Motor declarations
        private DcMotor leftDrive;
        private DcMotor rightDrive;

        @Override
        public void runOpMode() {
            // Initialize robot hardware
            leftDrive = hardwareMap.get(DcMotor.class, "left_drive");
            rightDrive = hardwareMap.get(DcMotor.class, "right_drive");

            // Wait for the game to start (driver presses PLAY)
            waitForStart();

            // Run until the end of the match (driver presses STOP)
            while (opModeIsActive()) {
                // Main robot control loop
                double drive = -gamepad1.left_stick_y;
                double turn = gamepad1.right_stick_x;
                
                leftDrive.setPower(drive + turn);
                rightDrive.setPower(drive - turn);
            }
        }
    }
  `,
  autonomousRobot: `
    public class AutonomousRobot extends LinearOpMode {
        private DcMotor leftDrive;
        private DcMotor rightDrive;
        private IMU imu;

        @Override
        public void runOpMode() {
            // Initialize robot hardware
            leftDrive = hardwareMap.get(DcMotor.class, "left_drive");
            rightDrive = hardwareMap.get(DcMotor.class, "right_drive");
            imu = hardwareMap.get(IMU.class, "imu");

            waitForStart();

            // Autonomous movement example
            moveForward(0.5, 1000);  // Move forward at 50% power for 1 second
            turn(0.3, 500);          // Turn at 30% power for 0.5 seconds
            moveForward(0.5, 1000);  // Move forward again
        }

        private void moveForward(double power, long milliseconds) {
            leftDrive.setPower(power);
            rightDrive.setPower(power);
            sleep(milliseconds);
            stopMotors();
        }

        private void turn(double power, long milliseconds) {
            leftDrive.setPower(power);
            rightDrive.setPower(-power);
            sleep(milliseconds);
            stopMotors();
        }

        private void stopMotors() {
            leftDrive.setPower(0);
            rightDrive.setPower(0);
        }
    }
  `
};

// GPT-4 Integration
export const getGPTHelp = async (code, question) => {
  try {
    const response = await axios.post(`${API_URL}/api/gpt/help`, {
      code,
      question
    });
    return response.data.answer;
  } catch (error) {
    console.error('Error getting GPT help:', error);
    throw error;
  }
};

// Progress Tracking
export const saveProgress = async (userId, lessonId, completed) => {
  try {
    const response = await axios.post(`${API_URL}/api/ftc/progress`, {
      userId,
      lessonId,
      completed
    });
    return response.data;
  } catch (error) {
    console.error('Error saving progress:', error);
    throw error;
  }
};

export const getUserProgress = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/api/ftc/progress/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
};
