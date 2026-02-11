module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      EXPO_PUBLIC_ELEVENLABS_AGENT_ID: process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID,
    },
  };
};
