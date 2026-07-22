import { useRef } from "react";

export const useMutationQueue = () => {
  const isProcessing = useRef(false); // Track if a mutation is running
  const queue = useRef<(() => Promise<any> | any)[]>([]); // Queue for storing pending mutations

  // Function to process the next mutation in the queue
  const processQueue = async () => {
    if (isProcessing.current || queue.current.length === 0) return;

    isProcessing.current = true;
    const nextMutation = queue.current.shift(); // Get the next request

    if (nextMutation) {
      try {
        await nextMutation(); // Execute the mutation
      } catch (error) {
        console.error("Mutation failed:", error);
      }
    }

    isProcessing.current = false;
    processQueue(); // Continue with the next request
  };

  // Function to add a mutation to the queue
  const addMutation = (mutationFn: () => Promise<any> | any) => {
    queue.current.push(mutationFn);
    processQueue(); // Start processing if not already running
  };

  return { addMutation };
};