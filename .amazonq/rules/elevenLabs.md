---
title: Quickstart
subtitle: Build your first conversational agent in as little as 5 minutes.
---

In this guide, you'll learn how to create your first conversational agent. This will serve as a foundation for building conversational workflows tailored to your business use cases.

## Getting started

ElevenLabs Agents are managed either through the [Agents Platform dashboard](https://elevenlabs.io/app/agents), the [ElevenLabs API](/docs/api-reference/introduction) or the [Agents CLI](/docs/agents-platform/operate/cli).

<Frame
  caption="The assistant at the bottom right corner of this page is an example of an ElevenLabs agent, capable of answering questions about ElevenLabs, navigating pages & taking you to external resources."
  background="subtle"
>
  ![ElevenLabs Agents](file:9694753d-3041-4e61-8a74-5e401dc5e651)
</Frame>

## Creating your first agent

In this quickstart guide we'll start by creating an agent via the API or the web dashboard. Next we'll test the agent, either by embedding it in your website or via the ElevenLabs dashboard.

<Tabs>
<Tab title="Build an agent via the web dashboard">
    In this guide, we'll create a conversational support assistant capable of answering questions about your product, documentation, or service. This assistant can be embedded into your website or app to provide real-time support to your customers.

    <Frame
      caption="The assistant at the bottom right corner of this page is capable of answering questions about ElevenLabs, navigating pages & taking you to external resources."
      background="subtle"
    >
      ![ElevenLabs Agents](file:9694753d-3041-4e61-8a74-5e401dc5e651)
    </Frame>

    <Steps>
      <Step title="Sign in to ElevenLabs">
        Go to [elevenlabs.io](https://elevenlabs.io/app/sign-up) and sign in to or create your account.
      </Step>
      <Step title="Create a new assistant">
        In the **ElevenLabs Dashboard**, create a new assistant by entering a name and selecting the `Blank template` option.
        <Frame caption="Creating a new assistant" background="subtle">
          ![Dashboard](file:34fdb86e-3903-49fc-9799-22f9c4f690ca)
        </Frame>
      </Step>
      <Step title="Configure the assistant behavior">
      Go to the **Agent** tab to configure the assistant's behavior. Set the following:
        <Steps>
          <Step title="First message">
            This is the first message the assistant will speak out loud when a user starts a conversation.

            ```plaintext First message
            Hi, this is Alexis from <company name> support. How can I help you today?
            ```
          </Step>
          <Step title="System prompt">
            This prompt guides the assistant's behavior, tasks, and personality.

            Customize the following example with your company details:
            ```plaintext System prompt
            You are a friendly and efficient virtual assistant for [Your Company Name]. Your role is to assist customers by answering questions about the company's products, services, and documentation. You should use the provided knowledge base to offer accurate and helpful responses.

            Tasks:
            - Answer Questions: Provide clear and concise answers based on the available information.
            - Clarify Unclear Requests: Politely ask for more details if the customer's question is not clear.

            Guidelines:
            - Maintain a friendly and professional tone throughout the conversation.
            - Be patient and attentive to the customer's needs.
            - If unsure about any information, politely ask the customer to repeat or clarify.
            - Avoid discussing topics unrelated to the company's products or services.
            - Aim to provide concise answers. Limit responses to a couple of sentences and let the user guide you on where to provide more detail.
            ```
          </Step>
        </Steps>

      </Step>
      <Step title="Add a knowledge base">
        Go to the **Knowledge Base** section to provide your assistant with context about your business.

        This is where you can upload relevant documents & links to external resources:

        - Include documentation, FAQs, and other resources to help the assistant respond to customer inquiries.
        - Keep the knowledge base up-to-date to ensure the assistant provides accurate and current information.

      </Step>
    </Steps>

    Next we'll configure the voice for your assistant.

    <Steps>
      <Step title="Select a voice">
        In the **Voice** tab, choose a voice that best matches your assistant from the [voice library](https://elevenlabs.io/voice-library):
        <Frame background="subtle">
          ![Voice settings](file:f76489f9-9aa4-4bf8-b5f6-c997a9273976)
        </Frame>
      <Note> Using higher quality voices, models, and LLMs may increase response time. For an optimal customer experience, balance quality and latency based on your assistant's expected use case.</Note>

      </Step>
      <Step title="Testing your assistant">
        Press the **Test AI agent** button and try conversing with your assistant.
      </Step>
    </Steps>

    Configure evaluation criteria and data collection to analyze conversations and improve your assistant's performance.

    <Steps>
      <Step title="Configure evaluation criteria">
        Navigate to the **Analysis** tab in your assistant's settings to define custom criteria for evaluating conversations.

        <Frame background="subtle">
          ![Analysis settings](file:4b558951-7add-4ea4-b7db-d3aa6cfbd895)
        </Frame>

        Every conversation transcript is passed to the LLM to verify if specific goals were met. Results will either be `success`, `failure`, or `unknown`, along with a rationale explaining the chosen result.

        Let's add an evaluation criteria with the name `solved_user_inquiry`:

        ```plaintext Prompt
        The assistant was able to answer all of the queries or redirect them to a relevant support channel.

        Success Criteria:
        - All user queries were answered satisfactorily.
        - The user was redirected to a relevant support channel if needed.
        ```

      </Step>

      <Step title="Configure data collection">
        In the **Data Collection** section, configure details to be extracted from each conversation.

        Click **Add item** and configure the following:

        1. **Data type:** Select "string"
        2. **Identifier:** Enter a unique identifier for this data point: `user_question`
        3. **Description:** Provide detailed instructions for the LLM about how to extract the specific data from the transcript:

        ```plaintext Prompt
        Extract the user's questions & inquiries from the conversation.
        ```
        <Tip>Test your assistant by posing as a customer. Ask questions, evaluate its responses, and tweak the prompts until you're happy with how it performs.</Tip>

      </Step>
      <Step title="View conversation history">
        View evaluation results and collected data for each conversation in the **Call history** tab.
        <Frame background="subtle">
          ![Conversation history](file:ee4d2165-a5e0-4ab3-b4e1-c44d62021d87)
        </Frame>
        <Tip>Regularly review conversation history to identify common issues and patterns.</Tip>
      </Step>
    </Steps>


    The newly created agent can be tested in a variety of ways, but the quickest way is to use the [ElevenLabs dashboard](https://elevenlabs.io/app/agents).

    <Info>
        The web dashboard uses our [React SDK](/docs/agents-platform/libraries/react) under the hood to handle real-time conversations.
    </Info>

    If instead you want to quickly test the agent in your own website, you can use the Agent widget. Simply paste the following HTML snippet into your website, taking care to replace `agent-id` with the ID of your agent.

    ```html
    <elevenlabs-convai agent-id="agent-id"></elevenlabs-convai>
    <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
    ```

  </Tab>
  <Tab title="Build an agent via the CLI">
    <Steps>
      <Step title="Install the CLI">
        ```bash
        npm install -g @elevenlabs/cli
        ```
      </Step>
      <Step title="Initialize a new project">
        ```bash
        elevenlabs agents init
        ```

        This creates the project structure with configuration directories and registry files.
      </Step>
      <Step title="Authenticate with ElevenLabs">
        [Create an API key in the dashboard here](https://elevenlabs.io/app/settings/api-keys), which you'll use to securely [use the CLI](/docs/api-reference/authentication).

        Then run the following command to authenticate with ElevenLabs:

        ```bash
        elevenlabs auth login
        ```

        Enter your ElevenLabs API key when prompted. The CLI will verify the key and store it securely.
      </Step>
      <Step title="Create the agent">
        Create your first agent using the assistant template:

        ```bash
        elevenlabs agents add "My Assistant" --template assistant
        ```
      </Step>
      <Step title="Push to ElevenLabs platform">
        ```bash
        elevenlabs agents push --agent "My Assistant"
        ```
        This uploads your local agent configuration to the ElevenLabs platform.
      </Step>
      <Step title="Test the agent">
        The newly created agent can be tested in a variety of ways, but the quickest way is to use the [ElevenLabs dashboard](https://elevenlabs.io/app/agents). From the dashboard, select your agent and click the **Test AI agent** button.

        <Info>
          The web dashboard uses our [React SDK](/docs/agents-platform/libraries/react) under the hood to handle real-time conversations.
        </Info>

        If instead you want to quickly test the agent in your own website, you can use the Agent widget. Use the CLI to generate the HTML snippet:

        ```bash
        elevenlabs agents widget "My Assistant"
        ```

        This will output the HTML snippet you can then paste directly into your website.
      </Step>
    </Steps>

  </Tab>
  <Tab title="Build an agent via the API">
    <Steps>
        <Step title="Create an API key">
            [Create an API key in the dashboard here](https://elevenlabs.io/app/settings/api-keys), which you’ll use to securely [access the API](/docs/api-reference/authentication).
            
            Store the key as a managed secret and pass it to the SDKs either as a environment variable via an `.env` file, or directly in your app’s configuration depending on your preference.
            
            ```js title=".env"
            ELEVENLABS_API_KEY=<your_api_key_here>
            ```
            
        </Step>
        <Step title="Install the SDK">
            We'll also use the `dotenv` library to load our API key from an environment variable.
            
            <CodeBlocks>
                ```python
                pip install elevenlabs
                pip install python-dotenv
                ```
            
                ```typescript
                npm install @elevenlabs/elevenlabs-js
                npm install dotenv
                ```
            
            </CodeBlocks>
            
        </Step>
        <Step title="Create the agent">
            Create a new file named `create_agent.py` or `createAgent.mts`, depending on your language of choice and add the following code:

            <CodeBlocks>

            ```python maxLines=0
            from dotenv import load_dotenv
            from elevenlabs.client import ElevenLabs
            import os
            load_dotenv()

            elevenlabs = ElevenLabs(
                api_key=os.getenv("ELEVENLABS_API_KEY"),
            )

            prompt = """
            You are a friendly and efficient virtual assistant for [Your Company Name].
            Your role is to assist customers by answering questions about the company's products, services,
            and documentation. You should use the provided knowledge base to offer accurate and helpful responses.

            Tasks:
            - Answer Questions: Provide clear and concise answers based on the available information.
            - Clarify Unclear Requests: Politely ask for more details if the customer's question is not clear.

            Guidelines:
            - Maintain a friendly and professional tone throughout the conversation.
            - Be patient and attentive to the customer's needs.
            - If unsure about any information, politely ask the customer to repeat or clarify.
            - Avoid discussing topics unrelated to the company's products or services.
            - Aim to provide concise answers. Limit responses to a couple of sentences and let the user guide you on where to provide more detail.
            """

            response = elevenlabs.conversational_ai.agents.create(
                name="My voice agent",
                tags=["test"], # List of tags to help classify and filter the agent
                conversation_config={
                    "tts": {
                        "voice_id": "aMSt68OGf4xUZAnLpTU8",
                        "model_id": "eleven_flash_v2"
                    },
                    "agent": {
                        "first_message": "Hi, this is Rachel from [Your Company Name] support. How can I help you today?",
                        "prompt": {
                            "prompt": prompt,
                        }
                    }
                }
            )

            print("Agent created with ID:", response.agent_id)
            ```

            ```typescript maxLines=0
            import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
            import "dotenv/config";

            const elevenlabs = new ElevenLabsClient();

            const prompt = `
                You are a friendly and efficient virtual assistant for [Your Company Name].
                Your role is to assist customers by answering questions about the company's products, services,
                and documentation. You should use the provided knowledge base to offer accurate and helpful responses.

                Tasks:
                - Answer Questions: Provide clear and concise answers based on the available information.
                - Clarify Unclear Requests: Politely ask for more details if the customer's question is not clear.

                Guidelines:
                - Maintain a friendly and professional tone throughout the conversation.
                - Be patient and attentive to the customer's needs.
                - If unsure about any information, politely ask the customer to repeat or clarify.
                - Avoid discussing topics unrelated to the company's products or services.
                - Aim to provide concise answers. Limit responses to a couple of sentences and let the user guide you on where to provide more detail.
            `;

            const agent = await elevenlabs.conversationalAi.agents.create({
                name: "My voice agent",
                tags: ["test"], // List of tags to help classify and filter the agent
                conversationConfig: {
                    tts: {
                        voiceId: "aMSt68OGf4xUZAnLpTU8",
                        modelId: "eleven_flash_v2",
                    },
                    agent: {
                        firstMessage: "Hi, this is Rachel from [Your Company Name] support. How can I help you today?",
                        prompt: {
                            prompt,
                        }
                    },
                },
            });

            console.log(`Agent created with ID: ${agent.agentId}`);
            ```
            </CodeBlocks>

            <Note>
                The agent created above will have a `"test"` tag, this is useful to help classify and filter the agent. For example distinguishing between test agents and production agents.
            </Note>
        </Step>
        <Step title="Run the code">
            <CodeBlocks>
                ```python
                python create_agent.py
                ```

                ```typescript
                npx tsx createAgent.mts
                ```
            </CodeBlocks>

            The above will generate an agent with some baseline settings and print the ID of the agent to the console. We'll customize the agent in a subsequent step.
        </Step>
        <Step title="Test the agent">
            The newly created agent can be tested in a variety of ways, but the quickest way is to use the [ElevenLabs dashboard](https://elevenlabs.io/app/agents). From the dashboard, select your agent and click the **Test AI agent** button.

            <Info>
                The web dashboard uses our [React SDK](/docs/agents-platform/libraries/react) under the hood to handle real-time conversations.
            </Info>

            If instead you want to quickly test the agent in your own website, you can use the Agent widget. Simply paste the following HTML snippet into your website, taking care to replace `agent-id` with the ID of your agent.

            ```html
            <elevenlabs-convai agent-id="agent-id"></elevenlabs-convai>
            <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
            ```

            View the SDKs tab to learn how to embed the agent in your website or app using the provided SDKs.
        </Step>
    </Steps>

  </Tab>
</Tabs>

## Next steps

As a follow up to this quickstart guide, you can make your agent more effective by integrating:

- [Knowledge bases](/docs/agents-platform/customization/knowledge-base) to equip it with domain-specific information.
- [Tools](/docs/agents-platform/customization/tools) to allow it to perform tasks on your behalf.
- [Authentication](/docs/agents-platform/customization/authentication) to restrict access to certain conversations.
- [Success evaluation](/docs/agents-platform/customization/agent-analysis/success-evaluation) to analyze conversations and improve its performance.
- [Data collection](/docs/agents-platform/customization/agent-analysis/data-collection) to collect data about conversations and improve its performance.
- [Conversation retention](/docs/agents-platform/customization/privacy/retention) to view conversation history and improve its performance.

---

title: React Native SDK
subtitle: >-
Agents Platform SDK: deploy customized, interactive voice agents in minutes
for React Native apps.

---

<Info>
  Refer to the [Agents Platform overview](/docs/agents-platform/overview) for an explanation of how
  Agents Platform works.
</Info>

## Installation

Install the package and its dependencies in your React Native project.

```shell
npm install @elevenlabs/react-native @livekit/react-native @livekit/react-native-webrtc livekit-client
```

<Tip>
  An example app using this SDK with Expo can be found
  [here](https://github.com/elevenlabs/packages/tree/main/examples/react-native-expo)
</Tip>

## Requirements

- React Native with LiveKit dependencies
- Microphone permissions configured for your platform
- Expo compatibility (development builds only)

<Warning>
  This SDK was designed and built for use with the Expo framework. Due to its dependency on
  LiveKit's WebRTC implementation, it requires development builds and cannot be used with Expo Go.
</Warning>

## Setup

### Provider Setup

Wrap your app with the `ElevenLabsProvider` to enable Agents Platform functionality.

```tsx
import { ElevenLabsProvider } from "@elevenlabs/react-native";
import React from "react";

function App() {
  return (
    <ElevenLabsProvider>
      <YourAppComponents />
    </ElevenLabsProvider>
  );
}
```

## Usage

### useConversation

A React Native hook for managing connection and audio usage for ElevenLabs Agents.

#### Initialize conversation

First, initialize the Conversation instance within a component that's wrapped by `ElevenLabsProvider`.

```tsx
import { useConversation } from "@elevenlabs/react-native";
import React from "react";

function ConversationComponent() {
  const conversation = useConversation();

  // Your component logic here
}
```

Note that Agents Platform requires microphone access. Consider explaining and requesting permissions in your app's UI before the Conversation starts, especially on mobile platforms where permission management is crucial.

#### Options

The Conversation can be initialized with certain options:

```tsx
const conversation = useConversation({
  onConnect: () => console.log("Connected to conversation"),
  onDisconnect: () => console.log("Disconnected from conversation"),
  onMessage: (message) => console.log("Received message:", message),
  onError: (error) => console.error("Conversation error:", error),
  onModeChange: (mode) => console.log("Conversation mode changed:", mode),
  onStatusChange: (prop) =>
    console.log("Conversation status changed:", prop.status),
  onCanSendFeedbackChange: (prop) =>
    console.log("Can send feedback changed:", prop.canSendFeedback),
  onUnhandledClientToolCall: (params) =>
    console.log("Unhandled client tool call:", params),
  onAudioAlignment: (alignment) =>
    console.log("Alignment data received:", alignment),
});
```

- **onConnect** - Handler called when the conversation WebRTC connection is established.
- **onDisconnect** - Handler called when the conversation WebRTC connection is ended.
- **onMessage** - Handler called when a new message is received. These can be tentative or final transcriptions of user voice, replies produced by LLM, or debug messages.
- **onError** - Handler called when an error is encountered.
- **onModeChange** - Handler called when the conversation mode changes. This is useful for indicating whether the agent is speaking or listening.
- **onStatusChange** - Handler called when the conversation status changes.
- **onCanSendFeedbackChange** - Handler called when the ability to send feedback changes.
- **onUnhandledClientToolCall** - Handler called when an unhandled client tool call is encountered.
- **onAudioAlignment** - Handler called when audio alignment data is received, providing character-level timing information for agent speech.

<Warning>
  Not all client events are enabled by default for an agent. If you have enabled a callback but
  aren't seeing events come through, ensure that your ElevenLabs agent has the corresponding event
  enabled. You can do this in the "Advanced" tab of the agent settings in the ElevenLabs dashboard.
</Warning>

#### Methods

##### startSession

The `startSession` method kicks off the WebRTC connection and starts using the microphone to communicate with the ElevenLabs Agents agent. The method accepts a configuration object with the `agentId` being conditionally required based on whether the agent is public or private.

###### Public agents

For public agents (i.e. agents that don't have authentication enabled), only the `agentId` is required. The Agent ID can be acquired through the [ElevenLabs UI](https://elevenlabs.io/app/agents).

```tsx
const conversation = useConversation();

// For public agents, pass in the agent ID
const startConversation = async () => {
  await conversation.startSession({
    agentId: "your-agent-id",
  });
};
```

###### Private agents

For private agents, you must pass in a `conversationToken` obtained from the ElevenLabs API. Generating this token requires an ElevenLabs API key.

<Tip>The `conversationToken` is valid for 10 minutes.</Tip>

```ts maxLines={0}
// Node.js server

app.get("/conversation-token", yourAuthMiddleware, async (req, res) => {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${process.env.AGENT_ID}`,
    {
      headers: {
        // Requesting a conversation token requires your ElevenLabs API key
        // Do NOT expose your API key to the client!
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      }
    }
  );

  if (!response.ok) {
    return res.status(500).send("Failed to get conversation token");
  }

  const body = await response.json();
  res.send(body.token);
);
```

Then, pass the token to the `startSession` method. Note that only the `conversationToken` is required for private agents.

```tsx
const conversation = useConversation();

const response = await fetch("/conversation-token", yourAuthHeaders);
const conversationToken = await response.text();

// For private agents, pass in the conversation token
const startConversation = async () => {
  await conversation.startSession({
    conversationToken,
  });
};
```

You can optionally pass a user ID to identify the user in the conversation. This can be your own customer identifier. This will be included in the conversation initiation data sent to the server.

```tsx
const startConversation = async () => {
  await conversation.startSession({
    agentId: "your-agent-id",
    userId: "your-user-id",
  });
};
```

##### endSession

A method to manually end the conversation. The method will disconnect and end the conversation.

```tsx
const endConversation = async () => {
  await conversation.endSession();
};
```

##### sendUserMessage

Send a text message to the agent during an active conversation.

```tsx
const sendMessage = async () => {
  await conversation.sendUserMessage("Hello, how can you help me?");
};
```

#### sendContextualUpdate

Sends contextual information to the agent that won't trigger a response.

```tsx
const sendContextualUpdate = async () => {
  await conversation.sendContextualUpdate(
    "User navigated to the profile page. Consider this for next response.",
  );
};
```

##### sendFeedback

Provide feedback on the conversation quality. This helps improve the agent's performance.

```tsx
const provideFeedback = async (liked: boolean) => {
  await conversation.sendFeedback(liked);
};
```

##### sendUserActivity

Notifies the agent about user activity to prevent interruptions. Useful for when the user is actively using the app and the agent should pause speaking, i.e. when the user is typing in a chat.

The agent will pause speaking for ~2 seconds after receiving this signal.

```tsx
const signalActivity = async () => {
  await conversation.sendUserActivity();
};
```

#### Properties

##### status

A React state containing the current status of the conversation.

```tsx
const { status } = useConversation();
console.log(status); // "connected" or "disconnected"
```

##### isSpeaking

A React state containing information on whether the agent is currently speaking. This is useful for indicating agent status in your UI.

```tsx
const { isSpeaking } = useConversation();
console.log(isSpeaking); // boolean
```

##### canSendFeedback

A React state indicating whether feedback can be submitted for the current conversation.

```tsx
const { canSendFeedback } = useConversation();

// Use this to conditionally show feedback UI
{
  canSendFeedback && (
    <FeedbackButtons
      onLike={() => conversation.sendFeedback(true)}
      onDislike={() => conversation.sendFeedback(false)}
    />
  );
}
```

##### getId

Retrieves the conversation ID.

```tsx
const conversationId = conversation.getId();
console.log(conversationId); // e.g., "conv_9001k1zph3fkeh5s8xg9z90swaqa"
```

##### setMicMuted

Mutes/unmutes the microphone.

```tsx
// Mute the microphone
conversation.setMicMuted(true);

// Unmute the microphone
conversation.setMicMuted(false);
```

## Example Implementation

Here's a complete example of a React Native component using the ElevenLabs Agents SDK:

```tsx
import { ElevenLabsProvider, useConversation } from "@elevenlabs/react-native";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

function ConversationScreen() {
  const [isConnected, setIsConnected] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to conversation");
      setIsConnected(true);
    },
    onDisconnect: () => {
      console.log("Disconnected from conversation");
      setIsConnected(false);
    },
    onMessage: (message) => {
      console.log("Message received:", message);
    },
    onError: (error) => {
      console.error("Conversation error:", error);
    },
  });

  const startConversation = async () => {
    try {
      await conversation.startSession({
        agentId: "your-agent-id",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error("Failed to end conversation:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>Status: {conversation.status}</Text>

      <Text style={styles.speaking}>
        Agent is {conversation.isSpeaking ? "speaking" : "not speaking"}
      </Text>

      <TouchableOpacity
        style={[styles.button, isConnected && styles.buttonActive]}
        onPress={isConnected ? endConversation : startConversation}
      >
        <Text style={styles.buttonText}>
          {isConnected ? "End Conversation" : "Start Conversation"}
        </Text>
      </TouchableOpacity>

      {conversation.canSendFeedback && (
        <View style={styles.feedbackContainer}>
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => conversation.sendFeedback(true)}
          >
            <Text>👍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => conversation.sendFeedback(false)}
          >
            <Text>👎</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function App() {
  return (
    <ElevenLabsProvider>
      <ConversationScreen />
    </ElevenLabsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  speaking: {
    fontSize: 14,
    marginBottom: 20,
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonActive: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  feedbackContainer: {
    flexDirection: "row",
    gap: 10,
  },
  feedbackButton: {
    backgroundColor: "#F2F2F7",
    padding: 10,
    borderRadius: 8,
  },
});

export default App;
```

## Platform-Specific Considerations

### iOS

Ensure microphone permissions are properly configured in your `Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access to enable voice conversations with AI agents.</string>
```

### Android

Add microphone permissions to your `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

Consider requesting runtime permissions before starting a conversation:

```tsx
import { PermissionsAndroid, Platform } from "react-native";

const requestMicrophonePermission = async () => {
  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: "Microphone Permission",
        message:
          "This app needs microphone access to enable voice conversations.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};
```

---

title: Cross-platform Voice Agents with Expo React Native
subtitle: >-
Build ElevenLabs agents that work across iOS and Android using Expo and the
ElevenLabs React Native SDK with WebRTC support.

---

## Introduction

In this tutorial you will learn how to build a voice agent that works across iOS and Android using [Expo React Native](https://expo.dev/) and the ElevenLabs [React Native SDK](/docs/agents-platform/libraries/react-native) with WebRTC support.

{/_ TODO: Add YT video once ready! _/}

<Tip title="Prefer to jump straight to the code?" icon="lightbulb">
  Find the [example project on
  GitHub](https://github.com/elevenlabs/elevenlabs-examples/tree/main/examples/conversational-ai/react-native/elevenlabs-conversational-ai-expo-react-native).
</Tip>

## Requirements

- An ElevenLabs account with an [API key](https://elevenlabs.io/app/settings/api-keys).
- Node.js v18 or higher installed on your machine.

## Setup

### Create a new Expo project

Using `create-expo-app`, create a new blank Expo project:

```bash
npx create-expo-app@latest --template blank-typescript
```

### Install dependencies

Install the ElevenLabs React Native SDK and its dependencies:

```bash
npx expo install @elevenlabs/react-native @livekit/react-native @livekit/react-native-webrtc @config-plugins/react-native-webrtc @livekit/react-native-expo-plugin @livekit/react-native-expo-plugin livekit-client
```

<Note>
  If you're running into an issue with peer dependencies, please add a `.npmrc` file in the root of
  the project with the following content: `legacy-peer-deps=true`.
</Note>

### Enable microphone permissions and add Expo plugins

In the `app.json` file, add the following permissions:

```json app.json
{
  "expo": {
    "scheme": "elevenlabs",
    // ...
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "This app uses the microphone to record audio."
      },
      "supportsTablet": true,
      "bundleIdentifier": "YOUR.BUNDLE.ID"
    },
    "android": {
      "permissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.CAMERA",
        "android.permission.INTERNET",
        "android.permission.MODIFY_AUDIO_SETTINGS",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.WAKE_LOCK",
        "android.permission.BLUETOOTH"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "YOUR.PACKAGE.ID"
    },
    "plugins": [
      "@livekit/react-native-expo-plugin",
      "@config-plugins/react-native-webrtc"
    ]
    // ...
  }
}
```

This will allow the React Native to prompt for microphone permissions when the conversation is started.

<Tip title="Note" icon="warning">
  For Android emulator you will need to enable "Virtual microphone uses host audio input" in the
  emulator microphone settings.
</Tip>

## Add ElevenLabs Agents to your app

Add the ElevenLabs Agents to your app by adding the following code to your `./App.tsx` file:

```tsx ./App.tsx
import { ElevenLabsProvider, useConversation } from "@elevenlabs/react-native";
import type {
  ConversationStatus,
  ConversationEvent,
  Role,
} from "@elevenlabs/react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { TextInput } from "react-native";

import { getBatteryLevel, changeBrightness, flashScreen } from "./utils/tools";

const ConversationScreen = () => {
  const conversation = useConversation({
    clientTools: {
      getBatteryLevel,
      changeBrightness,
      flashScreen,
    },
    onConnect: ({ conversationId }: { conversationId: string }) => {
      console.log("✅ Connected to conversation", conversationId);
    },
    onDisconnect: (details: string) => {
      console.log("❌ Disconnected from conversation", details);
    },
    onError: (message: string, context?: Record<string, unknown>) => {
      console.error("❌ Conversation error:", message, context);
    },
    onMessage: ({
      message,
      source,
    }: {
      message: ConversationEvent;
      source: Role;
    }) => {
      console.log(`💬 Message from ${source}:`, message);
    },
    onModeChange: ({ mode }: { mode: "speaking" | "listening" }) => {
      console.log(`🔊 Mode: ${mode}`);
    },
    onStatusChange: ({ status }: { status: ConversationStatus }) => {
      console.log(`📡 Status: ${status}`);
    },
    onCanSendFeedbackChange: ({
      canSendFeedback,
    }: {
      canSendFeedback: boolean;
    }) => {
      console.log(`🔊 Can send feedback: ${canSendFeedback}`);
    },
  });

  const [isStarting, setIsStarting] = useState(false);
  const [textInput, setTextInput] = useState("");

  const handleSubmitText = () => {
    if (textInput.trim()) {
      conversation.sendUserMessage(textInput.trim());
      setTextInput("");
      Keyboard.dismiss();
    }
  };

  const startConversation = async () => {
    if (isStarting) return;

    setIsStarting(true);
    try {
      await conversation.startSession({
        agentId: process.env.EXPO_PUBLIC_AGENT_ID,
        dynamicVariables: {
          platform: Platform.OS,
        },
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setIsStarting(false);
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error("Failed to end conversation:", error);
    }
  };

  const getStatusColor = (status: ConversationStatus): string => {
    switch (status) {
      case "connected":
        return "#10B981";
      case "connecting":
        return "#F59E0B";
      case "disconnected":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: ConversationStatus): string => {
    return status[0].toUpperCase() + status.slice(1);
  };

  const canStart = conversation.status === "disconnected" && !isStarting;
  const canEnd = conversation.status === "connected";

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.title}>ElevenLabs React Native Example</Text>
        <Text style={styles.subtitle}>
          Remember to set the agentId in the .env file!
        </Text>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(conversation.status) },
            ]}
          />
          <Text style={styles.statusText}>
            {getStatusText(conversation.status)}
          </Text>
        </View>

        {/* Speaking Indicator */}
        {conversation.status === "connected" && (
          <View style={styles.speakingContainer}>
            <View
              style={[
                styles.speakingDot,
                {
                  backgroundColor: conversation.isSpeaking
                    ? "#8B5CF6"
                    : "#D1D5DB",
                },
              ]}
            />
            <Text
              style={[
                styles.speakingText,
                { color: conversation.isSpeaking ? "#8B5CF6" : "#9CA3AF" },
              ]}
            >
              {conversation.isSpeaking ? "🎤 AI Speaking" : "👂 AI Listening"}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.startButton,
              !canStart && styles.disabledButton,
            ]}
            onPress={startConversation}
            disabled={!canStart}
          >
            <Text style={styles.buttonText}>
              {isStarting ? "Starting..." : "Start Conversation"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.endButton,
              !canEnd && styles.disabledButton,
            ]}
            onPress={endConversation}
            disabled={!canEnd}
          >
            <Text style={styles.buttonText}>End Conversation</Text>
          </TouchableOpacity>
        </View>

        {/* Feedback Buttons */}
        {conversation.status === "connected" &&
          conversation.canSendFeedback && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackLabel}>How was that response?</Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.likeButton]}
                  onPress={() => conversation.sendFeedback(true)}
                >
                  <Text style={styles.buttonText}>👍 Like</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.dislikeButton]}
                  onPress={() => conversation.sendFeedback(false)}
                >
                  <Text style={styles.buttonText}>👎 Dislike</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        {/* Text Input and Messaging */}
        {conversation.status === "connected" && (
          <View style={styles.messagingContainer}>
            <Text style={styles.messagingLabel}>Send Text Message</Text>
            <TextInput
              style={styles.textInput}
              value={textInput}
              onChangeText={(text) => {
                setTextInput(text);
                // Prevent agent from interrupting while user is typing
                if (text.length > 0) {
                  conversation.sendUserActivity();
                }
              }}
              placeholder="Type your message or context... (Press Enter to send)"
              multiline
              onSubmitEditing={handleSubmitText}
              returnKeyType="send"
              blurOnSubmit={true}
            />
            <View style={styles.messageButtons}>
              <TouchableOpacity
                style={[styles.button, styles.messageButton]}
                onPress={handleSubmitText}
                disabled={!textInput.trim()}
              >
                <Text style={styles.buttonText}>💬 Send Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.contextButton]}
                onPress={() => {
                  if (textInput.trim()) {
                    conversation.sendContextualUpdate(textInput.trim());
                    setTextInput("");
                    Keyboard.dismiss();
                  }
                }}
                disabled={!textInput.trim()}
              >
                <Text style={styles.buttonText}>📝 Send Context</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default function App() {
  return (
    <ElevenLabsProvider>
      <ConversationScreen />
    </ElevenLabsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  speakingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  speakingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  speakingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  toolsContainer: {
    backgroundColor: "#E5E7EB",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: "100%",
  },
  toolsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  toolItem: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#10B981",
  },
  endButton: {
    backgroundColor: "#EF4444",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  instructions: {
    marginTop: 24,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  feedbackContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: "row",
    gap: 16,
  },
  likeButton: {
    backgroundColor: "#10B981",
  },
  dislikeButton: {
    backgroundColor: "#EF4444",
  },
  messagingContainer: {
    marginTop: 24,
    width: "100%",
  },
  messagingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 16,
  },
  messageButtons: {
    flexDirection: "row",
    gap: 16,
  },
  messageButton: {
    backgroundColor: "#3B82F6",
    flex: 1,
  },
  contextButton: {
    backgroundColor: "#4F46E5",
    flex: 1,
  },
  activityContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  activityLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    textAlign: "center",
  },
  activityButton: {
    backgroundColor: "#F59E0B",
  },
});
```

### Native client tools

A big part of building ElevenLabs agents is allowing the agent access and execute functionality dynamically. This can be done via [client tools](/docs/agents-platform/customization/tools/client-tools).

Create a new file to hold your client tools: `./utils/tools.ts` and add the following code:

```ts ./utils/tools.ts
import * as Battery from "expo-battery";
import * as Brightness from "expo-brightness";

const getBatteryLevel = async () => {
  const batteryLevel = await Battery.getBatteryLevelAsync();
  console.log("batteryLevel", batteryLevel);
  if (batteryLevel === -1) {
    return "Error: Device does not support retrieving the battery level.";
  }
  return batteryLevel;
};

const changeBrightness = ({ brightness }: { brightness: number }) => {
  console.log("changeBrightness", brightness);
  Brightness.setSystemBrightnessAsync(brightness);
  return brightness;
};

const flashScreen = () => {
  Brightness.setSystemBrightnessAsync(1);
  setTimeout(() => {
    Brightness.setSystemBrightnessAsync(0);
  }, 200);
  return "Successfully flashed the screen.";
};

export { getBatteryLevel, changeBrightness, flashScreen };
```

### Dynamic variables

In addition to the client tools, we're also injecting the platform (web, iOS, Android) as a [dynamic variable](https://elevenlabs.io/docs/agents-platform/customization/personalization/dynamic-variables) both into the first message, and the prompt:

```tsx ./App.tsx
// ...
const startConversation = async () => {
  if (isStarting) return;

  setIsStarting(true);
  try {
    await conversation.startSession({
      agentId: process.env.EXPO_PUBLIC_AGENT_ID,
      dynamicVariables: {
        platform: Platform.OS,
      },
    });
  } catch (error) {
    console.error("Failed to start conversation:", error);
  } finally {
    setIsStarting(false);
  }
};
// ...
```

## Agent configuration

<Steps>
  <Step title="Sign in to ElevenLabs">
    Go to [elevenlabs.io](https://elevenlabs.io/app/sign-up) and sign in to your account.
  </Step>
  <Step title="Create a new agent">
    Navigate to [Agents Platform > Agents](https://elevenlabs.io/app/agents/agents) and
    create a new agent from the blank template.
  </Step>
  <Step title="Set the first message">
    Set the first message and specify the dynamic variable for the platform.

    ```txt
    Hi there, woah, so cool that I'm running on {{platform}}. What can I help you with?
    ```

  </Step>
  <Step title="Set the system prompt">
    Set the system prompt. You can also include dynamic variables here.

    ```txt
    You are a helpful assistant running on {{platform}}. You have access to certain tools that allow you to check the user device battery level and change the display brightness. Use these tools if the user asks about them. Otherwise, just answer the question.
    ```

  </Step>
  <Step title="Set up the client tools">
    Set up the following client tools:

    - Name: `getBatteryLevel`
        - Description: Gets the device battery level as decimal point percentage.
        - Wait for response: `true`
        - Response timeout (seconds): 3
    - Name: `changeBrightness`
        - Description: Changes the brightness of the device screen.
        - Wait for response: `true`
        - Response timeout (seconds): 3
        - Parameters:
            - Data Type: `number`
            - Identifier: `brightness`
            - Required: `true`
            - Value Type: `LLM Prompt`
            - Description: A number between 0 and 1, inclusive, representing the desired screen brightness.
    - Name: `flashScreen`
        - Description: Quickly flashes the screen on and off.
        - Wait for response: `true`
        - Response timeout (seconds): 3

  </Step>
</Steps>

## Run the app

This app requires some native dependencies that aren't supported in Expo Go, therefore you will need to prebuild the app and then run it on a native device.

- Terminal 1:
  - Run `npx expo prebuild --clean`

```bash
npx expo prebuild --clean
```

- Run `npx expo start --tunnel` to start the Expo development server over https.

```bash
npx expo start --tunnel
```

- Terminal 2:
  - Run `npx expo run:ios --device` to run the app on your iOS device.

```bash
npx expo run:ios --device
```
