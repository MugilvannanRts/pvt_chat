// import React, { useState, useEffect } from "react";
// import mqtt from "mqtt";
// import Modal from "react-modal";

// Modal.setAppElement("#root");

// export default function MyMqttForm() {
//     const [client, setClient] = useState(null);
//     const [subTopic, setSubTopic] = useState("chatroom/#");
//     const [pubTopic, setPubTopic] = useState("chatroom/mugil");
//     const [message, setMessage] = useState("");
//     const [messages, setMessages] = useState([]);
//     const [mediaRecorder, setMediaRecorder] = useState(null);
//     const [isRecording, setIsRecording] = useState(false);
//     const [imageToUpload, setImageToUpload] = useState(null);  // New state for image upload
//     const [isImageUpload, setIsImageUpload] = useState(false);  // New state to trigger image upload
//     const [lastSentMessage, setLastSentMessage] = useState("");  // Store the last sent message to prevent duplicates

//     // Function to format time as 2:00 AM
//     function getFormattedTime() {
//       return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
//     }

//     useEffect(() => {
//         const mqttClient = mqtt.connect("wss://test.mosquitto.org:8081/mqtt");
    
//         mqttClient.on("connect", () => {
//             console.log("Connected to MQTT broker");
//             mqttClient.subscribe(subTopic, (err) => {
//                 if (err) {
//                     console.error("Subscription error: ", err);
//                 } else {
//                     console.log(`Subscribed to ${subTopic}`);
//                 }
//             });
//         });
    
//         mqttClient.on("message", (topic, message) => {
//             const decodedMessage = message.toString();
//             console.log(`Received: ${decodedMessage} from topic: ${topic}`);
    
//             // Avoid adding the message that was just sent
//             if (decodedMessage === lastSentMessage) {
//                 return;
//             }

//             let sender = topic.split('/')[1];
//             const timestamp = getFormattedTime(); // Get the current time
    
//             // Add the received message to state
//             if (decodedMessage.startsWith("data:audio")) {
//                 setMessages((prevMessages) => [
//                     ...prevMessages,
//                     { topic: sender, type: "audio", content: decodedMessage, time: timestamp },
//                 ]);
//             } else if (decodedMessage.startsWith("data:image")) {
//                 setMessages((prevMessages) => [
//                     ...prevMessages,
//                     { topic: sender, type: "image", content: decodedMessage, time: timestamp },
//                 ]);
//             } else {
//                 setMessages((prevMessages) => [
//                     ...prevMessages,
//                     { topic: sender, type: "text", content: decodedMessage, time: timestamp },
//                 ]);
//             }
//         });
    
//         mqttClient.on("error", (err) => {
//             console.error("Connection error: ", err);
//         });
    
//         setClient(mqttClient);
    
//         return () => {
//             mqttClient.end();
//         };
//     }, [lastSentMessage]); // Re-run effect if lastSentMessage changes

//     function handlePublish() {
//         if (client && pubTopic && message) {
//             const timestamp = getFormattedTime(); // Get the current time
    
//             // Publish the message
//             client.publish(pubTopic, message, (err) => {
//                 if (err) {
//                     console.error("Publish error: ", err);
//                 } else {
//                     console.log(`Published to ${pubTopic}: ${message}`);
//                     setMessages((prevMessages) => [
//                         ...prevMessages,
//                         { topic: "mugil", type: "text", content: message, time: timestamp },
//                     ]);
//                     setLastSentMessage(message); // Store the last sent message
//                     setMessage("");
//                 }
//             });
//         }

//         if (imageToUpload) {
//             // Publish image after clicking send
//             const reader = new FileReader();
//             reader.readAsDataURL(imageToUpload);
//             reader.onloadend = () => {
//                 const base64Image = reader.result;
//                 if (client && pubTopic) {
//                     client.publish(pubTopic, base64Image);
//                     console.log("Image published to MQTT");

//                     const timestamp = getFormattedTime(); // Get the current time
//                     setMessages((prevMessages) => [
//                         ...prevMessages,
//                         { topic: "mugil", type: "image", content: base64Image, time: timestamp },
//                     ]);
//                     setLastSentMessage(base64Image); // Store the last sent message
//                     setImageToUpload(null); // Reset image upload state
//                 }
//             };
//         }
//     }

//     async function startRecording() {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         const recorder = new MediaRecorder(stream);
//         const chunks = [];

//         recorder.ondataavailable = (event) => {
//             chunks.push(event.data);
//         };

//         recorder.onstop = async () => {
//             const audioBlob = new Blob(chunks, { type: "audio/wav" });
//             const reader = new FileReader();
//             reader.readAsDataURL(audioBlob);
//             reader.onloadend = () => {
//                 const base64Audio = reader.result;
//                 if (client && pubTopic) {
//                     client.publish(pubTopic, base64Audio);
//                     console.log("Audio published to MQTT");
//                 }
//             };
//         };

//         recorder.start();
//         setMediaRecorder(recorder);
//         setIsRecording(true);
//     }

//     function stopRecording() {
//         if (mediaRecorder) {
//             mediaRecorder.stop();
//             setIsRecording(false);
//         }
//     }

//     function handleImageUpload(event) {
//         const file = event.target.files[0];
//         if (file) {
//             setImageToUpload(file);
//             setIsImageUpload(true);  // Trigger image upload state
//         }
//     }

//     return (
//         <>
//             <h1 className="text-2xl text-white p-3 text-center mt-6 bg-gray-800">Private Chat</h1>
//             <div className="border border-gray-100 m-8 rounded-xl shadow-xl p-2 overflow-auto" style={{ height: "650px", backgroundColor: "#faf6eb" }}>
//                 <div>
//                     {messages.map((msg, index) => (
//                         <div key={index} className={`shadow-lg bg-white rounded-xl p-3 mt-6 break-words ${msg.topic === "mugil" ? "ml-auto bg-green-200" : "mr-auto"} w-full sm:w-1/2 md:w-1/5`}>
//                             <strong className="text-purple-600">{msg.topic}</strong> <br />
//                             {msg.type === "text" && (
//                                 <p className="text-green-600">{msg.content}</p>
//                             )}

//                             {msg.type === "audio" && (
//                                 <audio controls>
//                                     <source src={msg.content} type="audio/mp3" />
//                                     Your browser does not support the audio element.
//                                 </audio>
//                             )}
//                             {msg.type === "image" && (
//                                 <img
//                                     src={msg.content}
//                                     alt="Received"
//                                     className="rounded-lg mt-2 max-w-xs cursor-pointer"
//                                 />
//                             )}
//                             <span className="text-xs text-gray-500">{msg.time}</span>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             <div className="flex bg-white flex-col items-center border border-gray-100 p-5 m-3 rounded-xl shadow-xl" style={{ position: "fixed", bottom: 0, left: 0, width: "99%" }}>
//                 <div className="mb-4 flex items-center w-full">
//                     <label htmlFor="imageUpload" className="cursor-pointer ml-2 mr-2 p-2 rounded-md text-white bg-gray-100 shadow-xl">
//                         <img src="./src/assets/attach.png" alt="Attach" style={{ width: '25px', height: '25px' }} />
//                     </label>
//                     <input
//                         type="file"
//                         accept="image/*"
//                         id="imageUpload"
//                         style={{ display: 'none' }}
//                         onChange={handleImageUpload}
//                     />
//                     <input
//                         style={{ flex: 1 }}
//                         className="bg-white rounded-md shadow-xl border p-2"
//                         value={message}
//                         onChange={(e) => setMessage(e.target.value)}
//                         type="text"
//                         placeholder="Type your message"
//                     />
//                     <button
//                         className="p-2 ml-2 mr-2 cursor-pointer rounded-md text-white bg-gray-100 shadow-xl"
//                         onClick={isRecording ? stopRecording : startRecording}
//                     >
//                         {isRecording ? <img src="./src/assets/micon.png" /> : <img src="./src/assets/micoff.png" style={{ width: '25px', height: '25px' }} />}
//                     </button>
//                     <img className="cursor-pointer ml-2 mr-2 shadow-xl" onClick={handlePublish} src="./src/assets/send.png" alt="Send" style={{ width: '30px', height: '30px' }} />
//                 </div>
//             </div>
//         </>
//     );
// }


import React, { useState, useEffect } from "react";
import mqtt from "mqtt";
import Modal from "react-modal";

Modal.setAppElement("#root");

export default function MyMqttForm() {
    const [client, setClient] = useState(null);
    const [subTopic, setSubTopic] = useState("chatroom/#");
    const [pubTopic, setPubTopic] = useState("chatroom/mugil");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [imageToUpload, setImageToUpload] = useState(null);
    const [isImageUpload, setIsImageUpload] = useState(false);
    const [lastSentMessage, setLastSentMessage] = useState("");

    // Function to format time as 2:00 AM
    function getFormattedTime() {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    useEffect(() => {
        const mqttClient = mqtt.connect("wss://test.mosquitto.org:8081/mqtt");
    
        mqttClient.on("connect", () => {
            console.log("Connected to MQTT broker");
            mqttClient.subscribe(subTopic, (err) => {
                if (err) {
                    console.error("Subscription error: ", err);
                } else {
                    console.log(`Subscribed to ${subTopic}`);
                }
            });
        });
    
        mqttClient.on("message", (topic, message) => {
            const decodedMessage = message.toString();
            console.log(`Received: ${decodedMessage} from topic: ${topic}`);
    
            // Avoid adding the message that was just sent
            if (decodedMessage === lastSentMessage) {
                return;
            }

            let sender = topic.split('/')[1];
            const timestamp = getFormattedTime(); // Get the current time
    
            // Add the received message to state
            if (decodedMessage.startsWith("data:audio")) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { topic: sender, type: "audio", content: decodedMessage, time: timestamp },
                ]);
            } else if (decodedMessage.startsWith("data:image")) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { topic: sender, type: "image", content: decodedMessage, time: timestamp },
                ]);
            } else {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { topic: sender, type: "text", content: decodedMessage, time: timestamp },
                ]);
            }
        });
    
        mqttClient.on("error", (err) => {
            console.error("Connection error: ", err);
        });
    
        setClient(mqttClient);
    
        return () => {
            mqttClient.end();
        };
    }, [lastSentMessage]); // Re-run effect if lastSentMessage changes

    function handlePublish() {
        if (client && pubTopic && message) {
            const timestamp = getFormattedTime(); // Get the current time
    
            // Publish the message
            client.publish(pubTopic, message, (err) => {
                if (err) {
                    console.error("Publish error: ", err);
                } else {
                    console.log(`Published to ${pubTopic}: ${message}`);
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { topic: "mugil", type: "text", content: message, time: timestamp },
                    ]);
                    setLastSentMessage(message); // Store the last sent message
                    setMessage("");
                }
            });
        }

        if (imageToUpload) {
            // Publish image after clicking send
            const reader = new FileReader();
            reader.readAsDataURL(imageToUpload);
            reader.onloadend = () => {
                const base64Image = reader.result;
                if (client && pubTopic) {
                    client.publish(pubTopic, base64Image);
                    console.log("Image published to MQTT");

                    const timestamp = getFormattedTime(); // Get the current time
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { topic: "mugil", type: "image", content: base64Image, time: timestamp },
                    ]);
                    setLastSentMessage(base64Image); // Store the last sent message
                    setImageToUpload(null); // Reset image upload state
                }
            };
        }
    }

    async function startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (event) => {
            chunks.push(event.data);
        };

        recorder.onstop = async () => {
            const audioBlob = new Blob(chunks, { type: "audio/wav" });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                const base64Audio = reader.result;
                if (client && pubTopic) {
                    client.publish(pubTopic, base64Audio);
                    console.log("Audio published to MQTT");
                }
            };
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
    }

    function stopRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            setImageToUpload(file);
            setIsImageUpload(true);  // Trigger image upload state
        }
    }

    return (
        <>
            <h1 className="text-2xl text-white p-3 text-center mt-6 bg-gray-800">Private Chat</h1>
            <div className="border border-gray-100 m-8 rounded-xl shadow-xl p-2 overflow-auto" style={{ height: "650px", backgroundColor: "#faf6eb" }}>
                <div>
                    {messages.map((msg, index) => (
                        <div key={index} className={`shadow-lg bg-white rounded-xl p-3 mt-6 break-words ${msg.topic === "mugil" ? "ml-auto bg-green-200" : "mr-auto"} w-full sm:w-1/2 md:w-1/5`}>
                            <strong className="text-purple-600">{msg.topic}</strong> <br />
                            {msg.type === "text" && (
                                <p className="text-green-600">{msg.content}</p>
                            )}

                            {msg.type === "audio" && (
                                <audio controls>
                                    <source src={msg.content} type="audio/mp3" />
                                    Your browser does not support the audio element.
                                </audio>
                            )}
                            {msg.type === "image" && (
                                <img
                                    src={msg.content}
                                    alt="Received"
                                    className="rounded-lg mt-2 max-w-xs cursor-pointer"
                                />
                            )}
                            <span className="text-xs text-gray-500">{msg.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex bg-white flex-col items-center border border-gray-100 p-5 m-3 rounded-xl shadow-xl" style={{ position: "fixed", bottom: 0, left: 0, width: "99%" }}>
                <div className="mb-4 flex items-center w-full">
                    <label htmlFor="imageUpload" className="cursor-pointer ml-2 mr-2 p-2 rounded-md text-white bg-gray-100 shadow-xl">
                        <img src="./src/assets/attach.png" alt="Attach" style={{ width: '25px', height: '25px' }} />
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        id="imageUpload"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                    />
                    <input
                        style={{ flex: 1 }}
                        className="bg-white rounded-md shadow-xl border p-2"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        type="text"
                        placeholder="Type your message"
                    />
                    <button
                        className="p-2 ml-2 mr-2 cursor-pointer rounded-md text-white bg-gray-100 shadow-xl"
                        onClick={isRecording ? stopRecording : startRecording}
                    >
                        {isRecording ? <img src="./src/assets/micon.png" /> : <img src="./src/assets/micoff.png" style={{ width: '25px', height: '25px' }} />}
                    </button>
                    <img className="cursor-pointer ml-2 mr-2 shadow-xl" onClick={handlePublish} src="./src/assets/send.png" alt="Send" style={{ width: '30px', height: '30px' }} />
                </div>
            </div>
        </>
    );
}
