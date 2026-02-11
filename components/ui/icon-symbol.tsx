// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolViewProps, SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<
  SymbolViewProps["name"],
  ComponentProps<typeof MaterialIcons>["name"]
>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "house": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "keyboard-arrow-down",
  "gear": "settings",
  "magnifyingglass": "search",
  "bell": "notifications",
  "message": "message",
  "message.fill": "message",
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "folder": "folder",
  "folder.fill": "folder",
  "person": "person",
  "person.fill": "person",
  "person.circle": "account-circle",
  "person.circle.fill": "account-circle",
  "person.2.fill": "people",
  "photo": "photo",
  "face.smiling": "emoji-emotions",
  "arrow.up": "keyboard-arrow-up",
  "arrow.up.right": "north-east",
  "arrow.right.square.fill": "logout",
  "arrow.triangle.2.circlepath": "sync",
  "play.fill": "play-arrow",
  "phone": "phone",
  "phone.fill": "phone",
  "phone.down.fill": "call-end",
  "video": "videocam",
  "exclamationmark.triangle.fill": "warning",
  "checkmark": "check",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "checkmark.circle.fill": "check-circle",
  "circle": "radio-button-unchecked",
  "circle.lefthalf.filled": "brightness-medium",
  "briefcase.fill": "work",
  "dollarsign.circle.fill": "attach-money",
  "brain.head.profile": "psychology",
  "lightbulb.fill": "lightbulb",
  "bell.fill": "notifications",
  "target": "track-changes",
  "calendar": "calendar-today",
  "crown.fill": "workspace-premium",
  "square.stack.3d.up.fill": "layers",
  "paintbrush.fill": "palette",
  "mic.fill": "mic",
  "questionmark.circle.fill": "help",
  "exclamationmark.triangle.fill": "report-problem",
  "info.circle.fill": "info",
  "star.fill": "star",
  "flag.fill": "flag",
  "textformat.size": "format-size",
  "sun.max.fill": "wb-sunny",
  "moon.fill": "nightlight",
  "sunrise.fill": "wb-twilight",
  "bubble.left.fill": "chat-bubble",
  "hand.raised.fill": "pan-tool",
  "doc.text.fill": "description",
  "globe": "language",
  "pencil": "edit",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
