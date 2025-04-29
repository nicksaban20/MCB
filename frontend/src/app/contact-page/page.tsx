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

export default function ContactPage({
  formData,
  setFormData
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}): JSX.Element {
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
    <Box w="100%" minH="100vh">
      <Container maxW="957px" py={0}>
        <Box w="800px" mx="auto" mt="65px" mb="45px">
          <VStack spacing={10} align="stretch">
            {/* Contact Information */}
            <Box>
              <Heading color="gray-800" mb={6} fontSize="21px" fontWeight="bold">
                Contact Information
              </Heading>
              <Button
                alignSelf="flex-right"
                bg="#3182CE"
                color="white"
                borderRadius="8px"
                px={6}
                py={2}
                fontWeight="semibold"
                fontSize="sm"
                _hover={{ bg: "#2B6CB0" }}
                onClick={() => {
                  setFormData((prev: any) => ({
                    ...prev,
                    firstName: "Jane",
                    lastName: "Doe",
                    email: "jane.doe@example.com",
                    phone: "123-456-7890",
                    streetAddress: "123 Campus Drive",
                    city: "Berkeley",
                    state: "CA",
                    zipCode: "94720",
                    department: "Molecular Cell Biology",
                    pi: "Dr. Smith",
                    chartstring: "1234-5678-9012",
                  }));
                  toast({
                    title: "Form autofilled",
                    description: "Your information was filled from the last order.",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                  });
                }}
              >
                Auto fill from last order (mock)
              </Button>
              <Stack spacing={6}>
                <Flex gap={6}>
                  <FormControl flex={1}>
                    <Input
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev: any) => ({ ...prev, firstName: e.target.value }))
                      }
                      bg="white"
                      border="1px solid gray"
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
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev: any) => ({ ...prev, lastName: e.target.value }))
                      }
                      bg="white"
                      border="1px solid gray"
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
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev: any) => ({ ...prev, email: e.target.value }))
                    }
                    bg="white"
                    border="1px solid gray"
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
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev: any) => ({ ...prev, phone: e.target.value }))
                    }
                    bg="white"
                    border="1px solid gray"
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
              <Heading color="#gray-800" mb={6} fontSize="21px" fontWeight="bold">
                Mailing Address
              </Heading>
              <Stack spacing={6}>
                <FormControl>
                  <Input
                    placeholder="Street Address"
                    value={formData.streetAddress}
                    onChange={(e) =>
                      setFormData((prev: any) => ({ ...prev, streetAddress: e.target.value }))
                    }
                    bg="white"
                    border="1px solid gray"
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
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev: any) => ({ ...prev, city: e.target.value }))
                      }
                      bg="white"
                      border="1px solid gray"
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
                      value={formData.state}
                      onChange={(e) =>
                        setFormData((prev: any) => ({ ...prev, state: e.target.value }))
                      }
                      bg="white"
                      border="1px solid gray"
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
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData((prev: any) => ({ ...prev, zipCode: e.target.value }))
                      }
                      bg="white"
                      border="1px solid gray"
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
              <Heading color="#gray-800" mb={6} fontSize="21px" fontWeight="bold">
                Additional Information
              </Heading>
              <Stack spacing={6}>
                <FormControl>
                  <Input
                    placeholder="UC Department or Off-Campus Organization"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData((prev: any) => ({ ...prev, department: e.target.value }))
                    }
                    bg="white"
                    border="1px solid gray"
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
                    value={formData.pi}
                    onChange={(e) =>
                      setFormData((prev: any) => ({ ...prev, pi: e.target.value }))
                    }
                    bg="white"
                    border="1px solid gray"
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
                    value={formData.chartstring}
                    onChange={(e) =>
                      setFormData((prev: any) => ({ ...prev, chartstring: e.target.value }))
                    }
                    bg="white"
                    border="1px solid gray"
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
                  <Text margin={10} color="#4B4B4B">OR</Text>
                  <Divider flex={1} borderColor="#E2E8F0" />
                </Flex>

                <Flex justify="space-between" align="start">
                  <Box w="324px">
                    <Heading color="#gray-800" fontSize="21px" fontWeight="bold" mb={1}>
                      Attach a PO
                    </Heading>
                    <Text color="#gray-800" fontSize="17px" fontStyle="italic">
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


          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
