import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useEmailSignupSearches = () => {
  const [searchesUsed, setSearchesUsed] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Get email from localStorage and listen for email submission
  useEffect(() => {
    const checkEmail = () => {
      const emailSubmitted = localStorage.getItem('email_submitted');
      const submittedEmail = localStorage.getItem('submitted_email');

      console.log('useEmailSignupSearches - checking email - emailSubmitted:', emailSubmitted, 'submittedEmail:', submittedEmail);

      if (emailSubmitted === 'true' && submittedEmail) {
        console.log('Email found in localStorage, fetching search count');
        setUserEmail(submittedEmail);
        fetchSearchCount(submittedEmail);
      } else {
        console.log('No email found in localStorage - hasEmail will be false');
        setLoading(false);
      }
    };

    // Check immediately on mount
    checkEmail();

    // Listen for custom event when email is submitted
    const handleEmailSubmitted = (e: Event) => {
      console.log('emailSubmitted event received!', (e as CustomEvent).detail);
      checkEmail();
    };

    window.addEventListener('emailSubmitted', handleEmailSubmitted);

    return () => {
      window.removeEventListener('emailSubmitted', handleEmailSubmitted);
    };
  }, []);

  const fetchSearchCount = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('email_signups')
        .select('searches_used')
        .eq('email', email.toLowerCase())
        .single();

      if (error) {
        console.error('Error fetching search count:', error);
        // Fallback: use localStorage if database fails
        const localCount = localStorage.getItem(`email_searches_${email.toLowerCase()}`);
        setSearchesUsed(localCount ? parseInt(localCount) : 0);
      } else if (data) {
        setSearchesUsed(data.searches_used || 0);
        // Also store in localStorage as backup
        localStorage.setItem(`email_searches_${email.toLowerCase()}`, String(data.searches_used || 0));
      }
    } catch (error) {
      console.error('Error:', error);
      // Fallback: use localStorage if database fails
      const localCount = localStorage.getItem(`email_searches_${email.toLowerCase()}`);
      setSearchesUsed(localCount ? parseInt(localCount) : 0);
    } finally {
      setLoading(false);
    }
  };

  const incrementSearchCount = async () => {
    if (!userEmail) return false;

    try {
      const newCount = searchesUsed + 1;

      // Update locally first for immediate UI feedback
      setSearchesUsed(newCount);

      // Also save to localStorage as backup
      localStorage.setItem(`email_searches_${userEmail.toLowerCase()}`, String(newCount));

      // Try to update in database
      const { error } = await supabase
        .from('email_signups')
        .update({ searches_used: newCount })
        .eq('email', userEmail.toLowerCase());

      if (error) {
        console.error('Error incrementing search count:', error);
        console.warn('Using localStorage backup - count:', newCount);
      } else {
        console.log('Successfully incremented search count to:', newCount);
      }

      return true;
    } catch (error) {
      console.error('Error:', error);
      // Still return true to allow search, localStorage has the count
      return true;
    }
  };

  const canSearch = () => {
    // If no email submitted yet, they can search (will show welcome modal)
    if (!userEmail) return true;

    // If they've used 3 or more searches, they need to upgrade
    return searchesUsed < 3;
  };

  const getRemainingSearches = () => {
    if (!userEmail) return 3;
    return Math.max(0, 3 - searchesUsed);
  };

  return {
    searchesUsed,
    loading,
    canSearch,
    incrementSearchCount,
    getRemainingSearches,
    hasEmail: !!userEmail,
  };
};