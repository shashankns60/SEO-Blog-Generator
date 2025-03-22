import React, { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked options for better formatting
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
});

function App() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState('');
  const [error, setError] = useState('');

  const generatePrompt = (keyword: string) => {
    return `Write a comprehensive, engaging blog article about "${keyword}". The article should:

1. Start with an attention-grabbing title and introduction
2. Include a brief overview of what readers will learn
3. Break down the content into clear sections with descriptive headings
4. Use a mix of:
   - Informative paragraphs
   - Helpful bullet points
   - Relevant examples
   - Expert quotes or statistics when appropriate
   - Practical tips and actionable advice
5. End with a strong conclusion and key takeaways
6. Include 5 frequently asked questions with answers

Important formatting:
- Use a single main title with #
- Use ## for major sections
- Use ### for subsections
- Use **bold** for emphasis
- Use > for important quotes or callouts
- Add --- between major sections
- Include relevant image suggestions with ![alt text](image-url)
- Add helpful links where appropriate

Make the content engaging, informative, and easy to read while maintaining SEO best practices. Write approximately 1500 words.`;
  };

  const generateArticle = async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword or topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
          'HTTP-Referer': window.location.href,
          'X-Title': 'SEO Blog Generator'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat:free',
          messages: [
            {
              role: 'user',
              content: generatePrompt(keyword)
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate article');
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      setArticle(generatedContent);
    } catch (err) {
      setError('Failed to generate article. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center mb-8">
          <FileText className="w-8 h-8 text-blue-600 mr-2" />
          <h1 className="text-3xl font-bold text-gray-900">SEO Blog Generator</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-4">
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your topic or keyword
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Sustainable Living Tips"
              />
              <button
                onClick={generateArticle}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Generating...
                  </span>
                ) : (
                  'Generate Article'
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {article && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Generated Article:</h2>
              <div 
                className="prose prose-blue max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-img:rounded-lg prose-hr:my-8 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-p:text-gray-700 prose-li:text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(marked(article))
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;