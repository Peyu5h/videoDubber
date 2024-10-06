import {
  MantineProvider as BaseMantineProvider,
  createTheme,
  type MantineColorsTuple,
} from "@mantine/core";

const orangeTheme = createTheme({
  primaryColor: "orange",
  colors: {
    orange: [
      "#FFF4E6",
      "#FFE8CC",
      "#FFD8A8",
      "#FFC078",
      "#FFA94D",
      "#FF922B",
      "#FD7E14",
      "#F76707",
      "#E8590C",
      "#D9480F",
    ],
  },
});

export function MantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseMantineProvider theme={orangeTheme}>{children}</BaseMantineProvider>
  );
}
