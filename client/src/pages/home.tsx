import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lightbulb } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Query } from "@shared/schema";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<Query | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitQuery = useMutation({
    mutationFn: async (question: string) => {
      const res = await apiRequest("POST", "/api/queries", { question });
      return res.json() as Promise<Query>;
    },
    onSuccess: (data) => {
      setResponse(data);
      queryClient.invalidateQueries({ queryKey: ["/api/queries"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process your question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (question.trim().length < 10) {
      toast({
        title: "Error", 
        description: "Please enter a more detailed question (at least 10 characters).",
        variant: "destructive",
      });
      return;
    }

    submitQuery.mutate(question);
  };

  const handleReset = () => {
    setQuestion("");
    setResponse(null);
  };

  const formatResponse = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">DataBot</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <span className="text-gray-500 text-sm">Intelligent Data Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              Looking for Insights? Ask me anything.
            </h2>
            <p className="text-gray-600">
              Ask any business intelligence question in plain English
            </p>
          </div>

        {/* Query Form */}
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="questionInput" className="sr-only">
                  Your question
                </label>
                <Textarea
                  id="questionInput"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Example: What were our top selling products last quarter?"
                  className="h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                  disabled={submitQuery.isPending}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submitQuery.isPending}
                  className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                >
                  {submitQuery.isPending ? (
                    <>
                      <span>Processing...</span>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <span>Submit Question</span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Response Section */}
        {response && (
          <div className="mt-6 animate-in slide-in-from-bottom-2 duration-300">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900 mb-2">AI Response</h3>
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: formatResponse(response.response) 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 text-center">
              <Button
                onClick={handleReset}
                variant="secondary"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
              >
                Ask a new question
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
