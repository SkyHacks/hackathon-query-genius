import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Lightbulb, Database } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Query } from "@shared/schema";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [supabaseQuestion, setSupabaseQuestion] = useState("");
  const [response, setResponse] = useState<Query | null>(null);
  const [supabaseResponse, setSupabaseResponse] = useState<Query | null>(null);
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

  const submitSupabaseQuery = useMutation({
    mutationFn: async (question: string) => {
      const res = await apiRequest("POST", "/api/supabase-query", { question });
      return res.json() as Promise<Query>;
    },
    onSuccess: (data) => {
      setSupabaseResponse(data);
      queryClient.invalidateQueries({ queryKey: ["/api/queries"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process your Supabase query. Please try again.",
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

  const handleSupabaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabaseQuestion.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (supabaseQuestion.trim().length < 10) {
      toast({
        title: "Error", 
        description: "Please enter a more detailed question (at least 10 characters).",
        variant: "destructive",
      });
      return;
    }

    submitSupabaseQuery.mutate(supabaseQuestion);
  };

  const handleReset = () => {
    setQuestion("");
    setResponse(null);
  };

  const handleSupabaseReset = () => {
    setSupabaseQuestion("");
    setSupabaseResponse(null);
  };

  const formatResponse = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            What question can I answer for you today?
          </h1>
          <p className="text-gray-600">
            Ask any business intelligence question in plain English
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ecommerce" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="ecommerce" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              E-commerce Data
            </TabsTrigger>
            <TabsTrigger value="supabase" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Supabase Data
            </TabsTrigger>
          </TabsList>

          {/* E-commerce Tab */}
          <TabsContent value="ecommerce">
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

            {/* E-commerce Response Section */}
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
          </TabsContent>

          {/* Supabase Tab */}
          <TabsContent value="supabase">
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-6">
                <form onSubmit={handleSupabaseSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="supabaseQuestionInput" className="sr-only">
                      Your Supabase question
                    </label>
                    <Textarea
                      id="supabaseQuestionInput"
                      value={supabaseQuestion}
                      onChange={(e) => setSupabaseQuestion(e.target.value)}
                      placeholder="Example: Show me all transactions with customer information"
                      className="h-32 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                      disabled={submitSupabaseQuery.isPending}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={submitSupabaseQuery.isPending}
                      className="bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                    >
                      {submitSupabaseQuery.isPending ? (
                        <>
                          <span>Processing...</span>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        </>
                      ) : (
                        <span>Query Supabase</span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Supabase Response Section */}
            {supabaseResponse && (
              <div className="mt-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <Database className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-green-900 mb-2">Supabase Analysis</h3>
                        <div 
                          className="text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: formatResponse(supabaseResponse.response) 
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-4 text-center">
                  <Button
                    onClick={handleSupabaseReset}
                    variant="secondary"
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                  >
                    Ask a new question
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
