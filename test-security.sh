#!/bin/bash

echo "🔒 TINNY Security Test"
echo "====================="
echo ""

echo "Checking for security issues..."
echo ""

# Check for .env in git
if git ls-files | grep -q "\.env$"; then
    echo "❌ CRITICAL: .env file is tracked in git!"
    echo "   Run: git rm --cached .env"
else
    echo "✅ .env file not in git"
fi

# Check for API keys in code
if grep -r "sk-" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "your_"; then
    echo "❌ WARNING: Possible API key found in source code!"
else
    echo "✅ No API keys found in source code"
fi

# Check if .gitignore exists
if [ -f .gitignore ]; then
    echo "✅ .gitignore exists"
else
    echo "❌ WARNING: No .gitignore file"
fi

# Check if middleware exists
if [ -f src/middleware.ts ]; then
    echo "✅ Security middleware exists"
else
    echo "❌ WARNING: No security middleware"
fi

# Check if validation exists
if [ -f src/lib/validation.ts ]; then
    echo "✅ Input validation utilities exist"
else
    echo "❌ WARNING: No validation utilities"
fi

echo ""
echo "Security check complete!"
echo ""
echo "Before deploying:"
echo "1. Review SECURITY_CHECKLIST.md"
echo "2. Set all environment variables in Vercel"
echo "3. Test RLS policies in Supabase"
echo "4. Enable email verification"
echo "5. Set OpenAI spending limits"
