import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';
import { useAuth } from '../components/auth/AuthContext';
import { ftcLessons, codeTemplates, getGPTHelp, saveProgress, getUserProgress } from '../services/ftcService';

const FTCJavaPage = () => {
  const { user } = useAuth();
  const [code, setCode] = useState(codeTemplates.basicRobot);
  const [output, setOutput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(ftcLessons[0]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [gptQuestion, setGptQuestion] = useState('');
  const [gptResponse, setGptResponse] = useState('');
  const [isAskingGPT, setIsAskingGPT] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  const loadUserProgress = async () => {
    try {
      const progress = await getUserProgress(user.id);
      setCompletedLessons(progress.completedLessons);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const runCode = async () => {
    setIsCompiling(true);
    setOutput('Compiling and running your code...');
    
    try {
      // TODO: Integrate with JDoodle or similar API for Java compilation
      setTimeout(() => {
        setOutput('Program completed successfully.\nMotors initialized and running!');
        setIsCompiling(false);
      }, 1000);
    } catch (error) {
      setOutput('Error running code: ' + error.message);
      setIsCompiling(false);
    }
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
    setCode(lesson.exercises[0].template);
  };

  const markLessonComplete = async () => {
    try {
      await saveProgress(user.id, selectedLesson.id, true);
      setCompletedLessons([...completedLessons, selectedLesson.id]);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const askGPT = async () => {
    if (!gptQuestion.trim()) return;
    
    setIsAskingGPT(true);
    try {
      const response = await getGPTHelp(code, gptQuestion);
      setGptResponse(response);
    } catch (error) {
      setGptResponse('Error getting help: ' + error.message);
    }
    setIsAskingGPT(false);
  };

  const loadTemplate = (templateName) => {
    setCode(codeTemplates[templateName]);
  };

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
    setCode(exercise.template);
  };

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionIndex]: answerIndex
    });
  };

  const checkQuizAnswers = () => {
    setShowQuizResults(true);
  };

  return (
    <Container>
      <Header>
        <Title>Java for FTC</Title>
        <Description>
          Learn Java programming for FIRST Tech Challenge robotics. Write and test your code directly in the browser!
        </Description>
      </Header>

      <MainContent>
        <LeftPanel>
          <LessonSection>
            <SectionTitle>Lessons</SectionTitle>
            <LessonList>
              {ftcLessons.map((lesson) => (
                <LessonItem 
                  key={lesson.id}
                  onClick={() => handleLessonSelect(lesson)}
                  isSelected={selectedLesson.id === lesson.id}
                  isCompleted={completedLessons.includes(lesson.id)}
                >
                  {lesson.title}
                  {completedLessons.includes(lesson.id) && <span>✓</span>}
                </LessonItem>
              ))}
            </LessonList>
          </LessonSection>

          <TemplateSection>
            <SectionTitle>Code Templates</SectionTitle>
            <TemplateList>
              <TemplateButton onClick={() => loadTemplate('basicRobot')}>
                Basic Robot
              </TemplateButton>
              <TemplateButton onClick={() => loadTemplate('autonomousRobot')}>
                Autonomous Robot
              </TemplateButton>
            </TemplateList>
          </TemplateSection>
        </LeftPanel>

        <CenterPanel>
          <EditorSection>
            <EditorHeader>
              <span>Code Editor</span>
              <ButtonGroup>
                <RunButton onClick={runCode} disabled={isCompiling}>
                  {isCompiling ? 'Running...' : 'Run Code'}
                </RunButton>
                <CompleteButton onClick={markLessonComplete}>
                  Mark Complete
                </CompleteButton>
              </ButtonGroup>
            </EditorHeader>
            <EditorContainer>
              <Editor
                height="500px"
                defaultLanguage="java"
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </EditorContainer>
          </EditorSection>

          <OutputSection>
            <OutputHeader>Output</OutputHeader>
            <OutputContent>
              {output || 'Your code output will appear here...'}
            </OutputContent>
          </OutputSection>
        </CenterPanel>

        <RightPanel>
          <GPTSection>
            <SectionTitle>Ask GPT-4</SectionTitle>
            <GPTInput
              value={gptQuestion}
              onChange={(e) => setGptQuestion(e.target.value)}
              placeholder="Ask a question about your code..."
            />
            <AskButton onClick={askGPT} disabled={isAskingGPT}>
              {isAskingGPT ? 'Getting Help...' : 'Ask GPT'}
            </AskButton>
            <GPTResponse>
              {gptResponse || 'GPT response will appear here...'}
            </GPTResponse>
          </GPTSection>

          <LessonContent>
            <SectionTitle>{selectedLesson.title}</SectionTitle>
            <LessonDescription>
              {selectedLesson.description}
            </LessonDescription>
            
            <SubSection>
              <SubTitle>Lesson Content</SubTitle>
              <CodeExample>
                {selectedLesson.content}
              </CodeExample>
            </SubSection>

            <SubSection>
              <SubTitle>Exercises</SubTitle>
              <ExerciseList>
                {selectedLesson.exercises.map((exercise, index) => (
                  <ExerciseItem 
                    key={index}
                    onClick={() => handleExerciseSelect(exercise)}
                    isSelected={selectedExercise && selectedExercise.title === exercise.title}
                  >
                    <ExerciseTitle>{exercise.title}</ExerciseTitle>
                    <ExerciseDescription>{exercise.description}</ExerciseDescription>
                  </ExerciseItem>
                ))}
              </ExerciseList>
            </SubSection>

            {selectedLesson.quiz && (
              <SubSection>
                <SubTitle>Quiz</SubTitle>
                <QuizSection>
                  {selectedLesson.quiz.map((question, qIndex) => (
                    <QuizQuestion key={qIndex}>
                      <QuestionText>{question.question}</QuestionText>
                      <OptionsList>
                        {question.options.map((option, oIndex) => (
                          <OptionItem 
                            key={oIndex}
                            isSelected={quizAnswers[qIndex] === oIndex}
                            isCorrect={showQuizResults && oIndex === question.correctAnswer}
                            isWrong={showQuizResults && quizAnswers[qIndex] === oIndex && oIndex !== question.correctAnswer}
                            onClick={() => handleQuizAnswer(qIndex, oIndex)}
                          >
                            {option}
                          </OptionItem>
                        ))}
                      </OptionsList>
                    </QuizQuestion>
                  ))}
                  <QuizButton onClick={checkQuizAnswers}>
                    Check Answers
                  </QuizButton>
                </QuizSection>
              </SubSection>
            )}
          </LessonContent>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  color: white;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #4CAF50;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #ccc;
  max-width: 800px;
  margin: 0 auto;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  @media (min-width: 1024px) {
    grid-template-columns: 3fr 2fr;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 250px;
`;

const CenterPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RightPanel = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LessonSection = styled.div`
  background: #1e1e1e;
  border-radius: 8px;
  padding: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #4CAF50;
`;

const LessonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const LessonItem = styled.div`
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => props.isSelected ? '#333' : 'transparent'};
  color: ${props => props.isCompleted ? '#4CAF50' : 'white'};
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: #333;
  }
`;

const TemplateSection = styled.div`
  background: #1e1e1e;
  border-radius: 8px;
  padding: 1rem;
`;

const TemplateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TemplateButton = styled.button`
  background: #2d2d2d;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #333;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const CompleteButton = styled.button`
  background: #2196F3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;

  &:hover {
    background: #1976D2;
  }
`;

const RunButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const EditorSection = styled.div`
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
`;

const EditorHeader = styled.div`
  background: #2d2d2d;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
`;

const EditorContainer = styled.div`
  border: 1px solid #333;
`;

const OutputSection = styled.div`
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
`;

const OutputHeader = styled.div`
  background: #2d2d2d;
  padding: 1rem;
  font-size: 1.1rem;
`;

const OutputContent = styled.pre`
  padding: 1rem;
  margin: 0;
  min-height: 200px;
  max-height: 500px;
  overflow-y: auto;
  font-family: 'Consolas', monospace;
  white-space: pre-wrap;
  color: #ddd;
`;

const GPTSection = styled.div`
  background: #1e1e1e;
  border-radius: 8px;
  padding: 1rem;
`;

const GPTInput = styled.textarea`
  width: 100%;
  height: 100px;
  background: #2d2d2d;
  border: 1px solid #333;
  border-radius: 4px;
  color: white;
  padding: 0.5rem;
  resize: vertical;
  margin-bottom: 0.5rem;
`;

const AskButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const GPTResponse = styled.div`
  background: #2d2d2d;
  border-radius: 4px;
  padding: 0.5rem;
  min-height: 100px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-family: 'Consolas', monospace;
  color: #ddd;
`;

const LessonContent = styled.div`
  background: #1e1e1e;
  border-radius: 8px;
  padding: 1rem;
`;

const LessonDescription = styled.p`
  color: #ddd;
  margin-bottom: 1rem;
`;

const CodeExample = styled.pre`
  background: #2d2d2d;
  border-radius: 4px;
  padding: 0.5rem;
  overflow-x: auto;
  font-family: 'Consolas', monospace;
  color: #ddd;
`;

const SubSection = styled.div`
  margin: 1.5rem 0;
`;

const SubTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #4a9eff;
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ExerciseItem = styled.div`
  padding: 1rem;
  background: ${props => props.isSelected ? '#2a4d7f' : '#1e1e1e'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2a4d7f;
  }
`;

const ExerciseTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #4a9eff;
`;

const ExerciseDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #ccc;
`;

const QuizSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const QuizQuestion = styled.div`
  background: #1e1e1e;
  padding: 1rem;
  border-radius: 8px;
`;

const QuestionText = styled.p`
  margin: 0 0 1rem 0;
  font-weight: 500;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OptionItem = styled.div`
  padding: 0.75rem;
  background: ${props => {
    if (props.isCorrect) return '#1a472a';
    if (props.isWrong) return '#5c1a1a';
    return props.isSelected ? '#2a4d7f' : '#2a2a2a';
  }};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => {
      if (props.isCorrect || props.isWrong) return;
      return '#2a4d7f';
    }};
  }
`;

const QuizButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #4a9eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #357abd;
  }
`;

export default FTCJavaPage;
