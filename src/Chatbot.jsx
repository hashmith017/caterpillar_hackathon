import React, { useState } from 'react';

const predefinedQA = [
    {
        question: "How do I log in?",
        answer: "To log in, please enter your username and select your role (User or Provider) on the main login page.",
        suggestions: ["What are the different roles?", "What happens if I forget my username?"]
    },
    {
        question: "How can I see my current rentals?",
        answer: "On the User Dashboard, you can see your current rentals in the 'Current Rental Details' table. You can also view your past rentals by clicking the 'Show Rental History' button.",
        suggestions: ["How is my efficiency score calculated?", "What are total rented hours?", "What is an overdue rental?"]
    },
    {
        question: "Where can I find the efficiency score of an equipment?",
        answer: "The efficiency score is listed in the main equipment table on both the User and Provider dashboards. It's a key metric to determine a machine's performance.",
        suggestions: ["How is the efficiency score calculated?", "What are total rented hours?", "What does high idle time mean?"]
    },
    {
        question: "How do I filter the equipment list?",
        answer: "On the Provider Dashboard, use the 'Filter & Search' bar to search by Equipment ID, Type, Site ID, or Operator ID. You can also sort the table by clicking on any of the column headers.",
        suggestions: ["What is the Operator Score?", "How can I view overdue rentals?", "How can I see my available equipment?"]
    },
    {
        question: "What is the Operator Score?",
        answer: "The Operator Score is a performance metric for providers, calculated based on an operator's average engine hours, idle hours, and overdue rentals.",
        suggestions: ["How are operators rated?", "What is a good Operator Score?", "How do I track an operator's performance?"]
    },
    {
        question: "What happens if a rental is overdue?",
        answer: "The dashboard automatically flags overdue rentals in red. Overdue machines are those that have passed their planned check-in date without being returned.",
        suggestions: ["Where can I see overdue rentals?", "How is the Operator Score affected by overdue rentals?"]
    },
    {
        question: "What does high idle time mean?",
        answer: "High idle time indicates that a machine's engine is running, but it is not being used for productive work. This can lead to increased fuel usage and lower efficiency.",
        suggestions: ["What is the Efficiency score based on?", "How can I see idle time distribution?", "How can I improve machine efficiency?"]
    }
];

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);

    const handleOpenChat = () => {
      setIsOpen(!isOpen);
      if (!isOpen) { 
        setMessages([]);
        setSuggestedQuestions(predefinedQA.map(qa => qa.question));
      }
    }

    const handleSendMessage = (event) => {
        event.preventDefault();
        const question = event.target.elements.message.value.trim();
        if (!question) return;

        const userMessage = { sender: 'user', text: question };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setSuggestedQuestions([]);
        event.target.elements.message.value = '';

        setTimeout(() => {
            let botAnswer = "I'm sorry, I don't have an answer for that. Your question has been forwarded to a human representative.";
            let newSuggestions = [];

            const matchedQA = predefinedQA.find(qa => 
                question.toLowerCase().includes(qa.question.toLowerCase().slice(0, 15))
            );

            if (matchedQA) {
                botAnswer = matchedQA.answer;
                if (matchedQA.suggestions) {
                    newSuggestions = matchedQA.suggestions;
                }
            } else {
                newSuggestions = predefinedQA.map(qa => qa.question);
            }

            const botMessage = { sender: 'bot', text: botAnswer };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
            setSuggestedQuestions(newSuggestions);
        }, 1000);
    };
    
    const handlePredefinedQuestion = (question) => {
        const fakeEvent = {
            preventDefault: () => {},
            target: {
                elements: {
                    message: { value: question }
                }
            }
        };
        handleSendMessage(fakeEvent);
    };

    const styles = {
        chatIcon: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#4299e1',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 1000
        },
        chatWindow: {
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '350px',
            height: '450px',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden'
        },
        chatHeader: {
            backgroundColor: '#4299e1',
            color: 'white',
            padding: '15px',
            textAlign: 'center',
            fontWeight: 'bold',
            position: 'relative'
        },
        chatClose: {
            position: 'absolute',
            top: '10px',
            right: '15px',
            cursor: 'pointer',
            fontSize: '20px'
        },
        chatBody: {
            flexGrow: 1,
            padding: '15px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: '#f7fafc'
        },
        chatMessage: {
            padding: '10px 15px',
            borderRadius: '20px',
            maxWidth: '75%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        userMessage: {
            backgroundColor: '#2b6cb0',
            color: 'white',
            alignSelf: 'flex-end',
            borderRadius: '20px 20px 5px 20px'
        },
        botMessage: {
            backgroundColor: '#e2e8f0',
            color: 'black',
            alignSelf: 'flex-start',
            borderRadius: '20px 20px 20px 5px'
        },
        chatInputForm: {
            display: 'flex',
            padding: '10px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: 'white'
        },
        chatInput: {
            flexGrow: 1,
            padding: '10px',
            borderRadius: '20px',
            border: '1px solid #cbd5e0',
            outline: 'none'
        },
        chatSendButton: {
            marginLeft: '10px',
            padding: '10px',
            borderRadius: '50%',
            backgroundColor: '#4299e1',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        },
        chatIntro: {
            textAlign: 'center',
            color: '#a0aec0',
            marginTop: 'auto',
            marginBottom: 'auto'
        },
        predefinedQuestions: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '15px',
        },
        predefinedQuestionButton: {
            backgroundColor: '#e2e8f0',
            border: 'none',
            borderRadius: '10px',
            padding: '10px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
        },
        suggestionsBox: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px 0',
            borderTop: '1px solid #e2e8f0',
            marginTop: '10px'
        },
        suggestionButton: {
            backgroundColor: '#e2e8f0',
            border: 'none',
            borderRadius: '15px',
            padding: '8px 12px',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.3s',
            alignSelf: 'flex-start'
        },
        suggestionHeader: {
            color: '#718096',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
        }
    };

    return (
        <>
            <div style={styles.chatIcon} onClick={handleOpenChat}>
                <i className="fas fa-robot" style={{ fontSize: '28px' }}></i>
            </div>

            {isOpen && (
                <div style={styles.chatWindow}>
                    <div style={styles.chatHeader}>
                        Smart Rental AI Assistant 🤖
                        <span onClick={handleOpenChat} style={styles.chatClose}>&times;</span>
                    </div>
                    <div style={styles.chatBody}>
                        {messages.length === 0 ? (
                            <div style={styles.chatIntro}>
                                <strong>Hello! How can I help you today?</strong>
                                <p style={{marginTop: '10px', marginBottom: '10px'}}>Here are some topics you can ask me about:</p>
                                <div style={styles.predefinedQuestions}>
                                    {predefinedQA.map((qa, index) => (
                                        <button key={index} style={styles.predefinedQuestionButton} onClick={() => handlePredefinedQuestion(qa.question)}>
                                            {qa.question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    style={{
                                        ...styles.chatMessage,
                                        ...(msg.sender === 'user' ? styles.userMessage : styles.botMessage)
                                    }}
                                >
                                    <span style={{ fontSize: '20px', marginRight: '10px' }}>{msg.sender === 'user' ? '🧑‍💻' : '🤖'}</span> {msg.text}
                                </div>
                            ))
                        )}
                        {suggestedQuestions.length > 0 && (
                            <div style={styles.suggestionsBox}>
                                <div style={styles.suggestionHeader}>Suggested Questions:</div>
                                {suggestedQuestions.map((q, index) => (
                                    <button key={index} style={styles.suggestionButton} onClick={() => handlePredefinedQuestion(q)}>
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSendMessage} style={styles.chatInputForm}>
                        <input
                            type="text"
                            name="message"
                            placeholder="Type a message..."
                            style={styles.chatInput}
                        />
                        <button type="submit" style={styles.chatSendButton}>
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;