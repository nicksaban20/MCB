"use client";

import React, { JSX, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";

export default function ContactPage(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const toast = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast({
        title: "File uploaded",
        description: selectedFile.name,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      toast({
        title: "File uploaded",
        description: droppedFile.name,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg="white" w="100%" minH="100vh">
      <Container maxW="957px" py={0}>
        <Box w="800px" mx="auto" mt="65px" mb="45px">
          <VStack spacing={10} align="stretch">
            {/* Contact Information */}
            <Box>
              <Heading color="#727272" mb={6} fontSize="21px" fontWeight="bold">
                Contact Information
              </Heading>
              <Stack spacing={6}>
                <Flex gap={6}>
                  <FormControl flex={1}>
                    <Input 
                      placeholder="First Name" 
                      bg="transparent"
                      border="1px solid #E2E8F0"
                      borderRadius="8px"
                      h="48px"
                      px={6}
                      w="100%"
                      _placeholder={{ color: '#A0AEC0' }}
                      _hover={{ borderColor: '#CBD5E0' }}
                      _focus={{ borderColor: '#3182CE', boxShadow: 'none' }}
                    />
                  </FormControl>
                  <FormControl flex={1}>
                    <Input 
                      placeholder="Last Name" 
                      bg="transparent"
                      border="1px solid #E2E8F0"
                      borderRadius="8px"
                      h="48px"
                      px={6}
                      w="100%"
                      _placeholder={{ color: '#A0AEC0' }}
                      _hover={{ borderColor: '#CBD5E0' }}
                      _focus={{ borderColor: '#3182CE', boxShadow: 'none' }}
                    />
                  </FormControl>
                </Flex>
                <FormControl>
                  <Input 
                    placeholder="Email Address" 
                    bg="transparent"
                    border="1px solid #E2E8F0"
                    borderRadius="8px"
                    h="48px"
                    px={6}
                    w="100%"
                    _placeholder={{ color: '#A0AEC0' }}
                    _hover={{ borderColor: '#CBD5E0' }}
                    _focus={{ borderColor: '#3182CE', boxShadow: 'none' }}
                  />
                </FormControl>
                <FormControl>
                  <Input 
                    placeholder="Phone Number" 
                    bg="transparent"
                    border="1px solid #E2E8F0"
                    borderRadius="8px"
                    h="48px"
                    px={6}
                    w="100%"
                    _placeholder={{ color: '#A0AEC0' }}
                    _hover={{ borderColor: '#CBD5E0' }}
                    _focus={{ borderColor: '#3182CE', boxShadow: 'none' }}
                  />
                </FormControl>
              </Stack>
            </Box>

            {/* Mailing Address */}
            <Box>
              <Heading color="#727272" mb={6} fontSize="21px" fontWeight="bold">
                Mailing Address
              </Heading>
              <Stack spacing={6}>
                <FormControl>
                  <Input 
                    placeholder="Street Address" 
                    bg="transparent"
                    border="1px solid #E2E8F0"
                    borderRadius="8px"
                    h="48px"
                    px={6}
                    w="100%"
                    _placeholder={{ color: '#A0AEC0' }}
                    _hover={{ borderColor: '#CBD5E0' }}
                    _focus={{ borderColor: '#3182CE', boxShadow: 'none' }}
                  />
                </FormControl>
                <Flex gap={6}>
                  <FormControl flex={1}>
                    <Input 
                      placeholder="City" 
                      bg="transparent"
                      border="1px solid #E2E8F0"
                      borderRadius="8px"
                      h="48px"
                      px={6}
                      w="100%"
                      _placeholder={{ color: '#A0AEC0' }}
                      _hover={{ borderColor: '#CBD5E0' }}
                      _focus={{ borderColor: '#3182CE', boxShadow: 'none' }}
                    />
                  </FormControl>
                  <FormControl flex={1}>
                    <Input 
                      placeholder="State" 
                      bg="transparent"
                      border="1px solid #E2E8F0"
                      borderRadius="8px"
                      h="48px"
                      px={6}
                      w="100%"
                      _placeholder={{ color: '#A0AEC0' }}
                      _hover={{ borderColor: '#CBD5E0' }}
                      _focus={{ borderColor: '#3182CE', boxShadow: 'none' }}
                    />
                  </FormControl>
                  <FormControl flex={1}>
                    <Input 
                      placeholder="Zip Code" 
                      bg="transparent"
                      border="1px solid #E2E8F0"
                      borderRadius="8px"
                      h="48px"
                      px={6}
                      w="100%"
                      _placeholder={{ color: '#A0AEC0' }}
                      _hover={{ borderColor: '#CBD5E0' }}
                      _focus={{ borderColor: '#3182CE', boxShadow: 'none' }}
                    />
                  </FormControl>
                </Flex>
              </Stack>
            </Box>

            {/* Additional Information */}
            <Box>
              <Heading color="#727272" mb={6} fontSize="21px" fontWeight="bold">
                Additional Information
              </Heading>
              <Stack spacing={6}>
                <FormControl>
                  <Input 
                    placeholder="UC Department or Off-Campus Organization" 
                    bg="transparent"
                    border="1px solid #E2E8F0"
                    borderRadius="8px"
                    h="48px"
                    px={6}
                    w="100%"
                    _placeholder={{ color: '#A0AEC0' }}
                    _hover={{ borderColor: '#CBD5E0' }}
                    _focus={{ borderColor: '#3182CE', boxShadow: 'none' }}
                  />
                </FormControl>
                <FormControl>
                  <Input 
                    placeholder="Principal Investigator" 
                    bg="transparent"
                    border="1px solid #E2E8F0"
                    borderRadius="8px"
                    h="48px"
                    px={6}
                    w="100%"
                    _placeholder={{ color: '#A0AEC0' }}
                    _hover={{ borderColor: '#CBD5E0' }}
                    _focus={{ borderColor: '#3182CE', boxShadow: 'none' }}
                  />
                </FormControl>
                <FormControl>
                  <Input 
                    placeholder="Chartstring" 
                    bg="transparent"
                    border="1px solid #E2E8F0"
                    borderRadius="8px"
                    h="48px"
                    w="100%"
                    px={6}
                    _placeholder={{ color: '#A0AEC0' }}
                    _hover={{ borderColor: '#CBD5E0' }}
                    _focus={{ borderColor: '#3182CE', boxShadow: 'none' }}
                  />
                </FormControl>

                <Flex align="center" gap={3}>
                  <Divider flex={1} borderColor="#E2E8F0" />
                  <Text color="#4B4B4B">OR</Text>
                  <Divider flex={1} borderColor="#E2E8F0" />
                </Flex>

                <Flex justify="space-between" align="start">
                  <Box w="324px">
                    <Heading color="#727272" fontSize="21px" fontWeight="bold" mb={1}>
                      Attach a PO
                    </Heading>
                    <Text color="#727272" fontSize="17px" fontStyle="italic">
                      Upload your purchase order file
                    </Text>
                  </Box>
                  <Box
                    as="label"
                    w="350px"
                    h="120px"
                    border="1px solid #E2E8F0"
                    borderRadius="8px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                    bg={isDragging ? '#EDF2F7' : '#F7FAFC'}
                    _hover={{ borderColor: '#CBD5E0', bg: '#EDF2F7' }}
                    cursor="pointer"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx"
                    />
                    <Icon as={FiUpload} w={6} h={6} color="#4A5568" />
                    <Text color="#4A5568">
                      {file ? file.name : 'Upload File'}
                    </Text>
                  </Box>
                </Flex>
              </Stack>
            </Box>

            {/* Buttons */}
            <Flex gap={6} w="100%" mt={4} justify="flex-end">
              <Button
                variant="outline"
                h="40px"
                w="60px"
                borderRadius="6px"
                bg="white"
                borderColor="#E2E8F0"
                color="#727272"
                fontSize="16px"
                fontWeight="medium"
                _hover={{ bg: '#F7FAFC', borderColor: '#CBD5E0' }}
                _active={{ bg: '#EDF2F7' }}
                transition="all 0.2s"
              >
                Back
              </Button>
              <Button
                h="40px"
                w="60px"
                borderRadius="6px"
                bg="#4A4A4A"
                color="white"
                fontSize="16px"
                fontWeight="medium"
                _hover={{ bg: '#3D3D3D' }}
                _active={{ bg: '#2D2D2D' }}
                transition="all 0.2s"
              >
                Next
              </Button>
            </Flex>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
