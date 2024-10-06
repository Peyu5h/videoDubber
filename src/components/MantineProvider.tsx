import {
  MantineProvider as BaseMantineProvider,
  createTheme,
  type MantineColorsTuple,
} from "@mantine/core";

const createColorTuple = (color: string): MantineColorsTuple => [
  color,
  color,
  color,
  color,
  color,
  color,
  color,
  color,
  color,
  color,
];

const theme = createTheme({
  colors: {
    "background-dark": createColorTuple("#1A1B1E"),
    "track-orange": createColorTuple("#FF6B00"),
    "track-purple": createColorTuple("#7000FF"),
    "track-pink": createColorTuple("#FF00D6"),
  },
});

export function MantineProvider({ children }: { children: React.ReactNode }) {
  return <BaseMantineProvider theme={theme}>{children}</BaseMantineProvider>;
}
