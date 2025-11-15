// ═══════════════════════════════════════════════════════════════
// WOLFRAM ALPHA API SERVICE
// ═══════════════════════════════════════════════════════════════
// Provides computational intelligence for learning
// Free tier: 2,000 queries/month

const WOLFRAM_APP_ID = import.meta.env.VITE_WOLFRAM_APP_ID;
const WOLFRAM_API_URL = 'https://api.wolframalpha.com/v2/query';
const SIMPLE_API_URL = 'https://api.wolframalpha.com/v1/simple';

/**
 * Query Wolfram Alpha Simple API
 * Returns an image URL with the answer
 * @param {string} query - The question or problem to solve
 * @returns {Promise<Object>} Result with imageUrl or error
 */
export async function getSimpleAnswer(query) {
  try {
    if (!WOLFRAM_APP_ID) {
      console.warn('Wolfram API key not configured');
      return {
        success: false,
        error: 'Wolfram API key not configured. Please add VITE_WOLFRAM_APP_ID to .env'
      };
    }

    const params = new URLSearchParams({
      appid: WOLFRAM_APP_ID,
      i: query,
      background: 'F5F5F5',
      foreground: '333333',
      layout: 'labelbar',
      fontsize: 16,
      width: 800
    });

    const url = `${SIMPLE_API_URL}?${params}`;
    
    // Return the image URL (Wolfram returns PNG)
    return {
      success: true,
      imageUrl: url,
      query: query
    };
  } catch (error) {
    console.error('Wolfram Simple API error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Query Wolfram Alpha Full API
 * Returns structured data with multiple "pods"
 * @param {string} query - The question or problem to solve
 * @returns {Promise<Object>} Result with pods array or error
 */
export async function getFullAnswer(query) {
  try {
    if (!WOLFRAM_APP_ID) {
      return {
        success: false,
        error: 'Wolfram API key not configured'
      };
    }

    const params = new URLSearchParams({
      appid: WOLFRAM_APP_ID,
      input: query,
      format: 'plaintext,image',
      output: 'json'
    });

    // Use CORS proxy for browser requests (Wolfram API doesn't support CORS)
    // Alternative: use JSONP callback
    const proxyUrl = 'https://corsproxy.io/?';
    const apiUrl = `${WOLFRAM_API_URL}?${params}`;
    
    const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();

    if (data.queryresult?.success) {
      return {
        success: true,
        pods: data.queryresult.pods.map(pod => ({
          title: pod.title,
          text: pod.subpods?.[0]?.plaintext || '',
          image: pod.subpods?.[0]?.img?.src || null
        })),
        query: query
      };
    }

    return {
      success: false,
      error: 'No results found'
    };
  } catch (error) {
    console.error('Wolfram Full API error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get step-by-step math solution
 * @param {string} mathProblem - The math problem to solve
 * @returns {Promise<Object>} Result with solution and steps
 */
export async function getStepByStep(mathProblem) {
  try {
    if (!WOLFRAM_APP_ID) {
      return {
        success: false,
        error: 'Wolfram API key not configured'
      };
    }

    const params = new URLSearchParams({
      appid: WOLFRAM_APP_ID,
      input: `solve ${mathProblem}`,
      podstate: 'Step-by-step solution',
      format: 'plaintext,image',
      output: 'json'
    });

    const response = await fetch(`${WOLFRAM_API_URL}?${params}`);
    const data = await response.json();

    if (data.queryresult?.success) {
      const solutionPod = data.queryresult.pods.find(
        pod => pod.title.includes('Solution') || pod.title.includes('Result')
      );

      const stepsPod = data.queryresult.pods.find(
        pod => pod.title.includes('Step')
      );

      return {
        success: true,
        solution: solutionPod?.subpods?.[0]?.plaintext || '',
        steps: stepsPod?.subpods?.[0]?.plaintext || '',
        solutionImage: solutionPod?.subpods?.[0]?.img?.src,
        stepsImage: stepsPod?.subpods?.[0]?.img?.src
      };
    }

    return {
      success: false,
      error: 'Could not solve problem'
    };
  } catch (error) {
    console.error('Wolfram Step-by-step error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get concept explanation with visuals
 * @param {string} concept - The concept to explain
 * @returns {Promise<Object>} Result with explanation pods
 */
export async function explainConcept(concept) {
  try {
    if (!WOLFRAM_APP_ID) {
      return {
        success: false,
        error: 'Wolfram API key not configured'
      };
    }

    const params = new URLSearchParams({
      appid: WOLFRAM_APP_ID,
      input: concept,
      format: 'plaintext,image',
      output: 'json'
    });

    const response = await fetch(`${WOLFRAM_API_URL}?${params}`);
    const data = await response.json();

    if (data.queryresult?.success) {
      return {
        success: true,
        pods: data.queryresult.pods.map(pod => ({
          title: pod.title,
          text: pod.subpods?.[0]?.plaintext || '',
          image: pod.subpods?.[0]?.img?.src || null
        }))
      };
    }

    return {
      success: false,
      error: 'Concept not found'
    };
  } catch (error) {
    console.error('Wolfram Explain error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Plot mathematical functions
 * @param {string} functionStr - The function to plot
 * @returns {Promise<Object>} Result with plot image URL
 */
export async function plotFunction(functionStr) {
  try {
    if (!WOLFRAM_APP_ID) {
      return {
        success: false,
        error: 'Wolfram API key not configured'
      };
    }

    const params = new URLSearchParams({
      appid: WOLFRAM_APP_ID,
      i: `plot ${functionStr}`,
      background: 'F5F5F5',
      foreground: '333333',
      width: 800
    });

    const url = `${SIMPLE_API_URL}?${params}`;
    
    return {
      success: true,
      imageUrl: url,
      function: functionStr
    };
  } catch (error) {
    console.error('Wolfram Plot error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Universal query function for Wolfram Alpha
 * @param {string} query - The question or problem
 * @param {string} mode - 'simple', 'full', or 'knowledge'
 * @returns {Promise<string|Object>} Result based on mode
 */
export async function queryWolfram(query, mode = 'simple') {
  try {
    if (!WOLFRAM_APP_ID) {
      console.warn('Wolfram API key not configured');
      return null;
    }

    if (mode === 'simple') {
      const result = await getSimpleAnswer(query);
      return result.success ? result.imageUrl : null;
    }

    if (mode === 'full' || mode === 'knowledge') {
      const result = await getFullAnswer(query);
      if (result.success && result.pods) {
        // Return plain text content from all pods
        return result.pods
          .map(pod => `${pod.title}:\n${pod.text}`)
          .filter(text => text.length > 0)
          .join('\n\n');
      }
    }

    return null;
  } catch (error) {
    console.error('Wolfram query error:', error);
    return null;
  }
}

export default {
  getSimpleAnswer,
  getFullAnswer,
  getStepByStep,
  explainConcept,
  plotFunction,
  queryWolfram
};
