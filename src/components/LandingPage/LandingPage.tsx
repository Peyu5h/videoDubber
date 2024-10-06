import { useState } from "react";
import {
  Text,
  Button,
  Group,
  useMantineTheme,
  Box,
  Container,
} from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { IconUpload, IconX, IconFile } from "@tabler/icons-react";
import { motion } from "framer-motion";

interface LandingPageProps {
  onFileSelect: (file: File) => void;
}

export default function LandingPage({ onFileSelect }: LandingPageProps) {
  const theme = useMantineTheme();
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (files: FileWithPath[]) => {
    const file = files[0];
    if (file.type.startsWith("audio/")) {
      onFileSelect(file);
    } else {
      setError("Please upload an audio file.");
    }
  };

  return (
    <Container size="sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box my="xl">
          <Text ta="center" size="xl" fw={700} mb="lg">
            Audio Cutter
          </Text>
          <Text ta="center" color="dimmed" mb="xl">
            Free editor to trim and cut any audio file online
          </Text>
          <Dropzone
            onDrop={handleDrop}
            onReject={() => setError("File rejected. Please try again.")}
            maxSize={30 * 1024 ** 2}
            accept={["audio/*"]}
            multiple={false}
          >
            <Group style={{ minHeight: 220, pointerEvents: "none" }}>
              <Dropzone.Accept>
                <IconUpload
                  size={50}
                  stroke={1.5}
                  color={theme.colors["track-orange"][6]}
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size={50} stroke={1.5} color={theme.colors.red[6]} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconFile size={50} stroke={1.5} />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline>
                  Drag audio files here or click to select files
                </Text>
                <Text size="sm" color="dimmed" inline mt={7}>
                  Attach one audio file, file should not exceed 30mb
                </Text>
              </div>
            </Group>
          </Dropzone>
          {error && (
            <Text color="red" ta="center" mt="sm">
              {error}
            </Text>
          )}
        </Box>
      </motion.div>
    </Container>
  );
}
