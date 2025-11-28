import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * AI Auto-fill endpoint - analyzes uploaded documents and generates form content
 */
export async function POST(request: NextRequest) {
  try {
    const { uploadedFiles, fullName, visaType, fieldOfProfession } = await request.json();

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'No uploaded files provided' },
        { status: 400 }
      );
    }

    // Combine content from all uploaded files
    const combinedContent = uploadedFiles
      .map((file: any, index: number) => {
        const content = file.extractedText || file.content || file.text || file.summary || '';
        return `\n\n=== Document ${index + 1}: ${file.fileName || file.name} ===\n${content}`;
      })
      .join('\n');

    const prompt = `You are analyzing documents for a ${visaType} visa petition for ${fullName} in the field of ${fieldOfProfession}.

Based on the uploaded documents below, please extract and generate:

1. **Petitioner Name**: If mentioned, the organization or individual filing the petition
2. **Itinerary/Work Schedule**: Any mentioned dates, events, competitions, training schedules, or planned U.S. activities
3. **Additional Information**: Notable achievements, rankings, statistics, affiliations, coaches, mentors, facilities, or any other relevant context

UPLOADED DOCUMENTS:
${combinedContent.substring(0, 50000)}

Please respond in JSON format:
{
  "petitionerName": "extracted or inferred petitioner name, or empty string if not found",
  "itinerary": "formatted itinerary with dates and activities, or empty string if not found",
  "additionalInfo": "relevant additional context, achievements, and details, or empty string if not found"
}

Be concise but comprehensive. Format the itinerary as a bulleted list if multiple items exist.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      petitionerName: result.petitionerName || '',
      itinerary: result.itinerary || '',
      additionalInfo: result.additionalInfo || '',
    });
  } catch (error: any) {
    console.error('[Autofill] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to auto-fill from documents',
      },
      { status: 500 }
    );
  }
}
