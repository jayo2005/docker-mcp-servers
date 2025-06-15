#!/usr/bin/env node
import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

console.log('Testing GitHub authentication...');
console.log('Token:', GITHUB_TOKEN ? `${GITHUB_TOKEN.substring(0, 10)}...` : 'NOT SET');

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

try {
  // Test authentication
  const { data: user } = await octokit.users.getAuthenticated();
  console.log('✓ Authenticated as:', user.login);
  
  // Test creating a repository
  console.log('\nTesting repository creation...');
  const { data: repo } = await octokit.repos.createForAuthenticatedUser({
    name: 'test-auth-' + Date.now(),
    description: 'Test repository for authentication',
    private: false,
  });
  console.log('✓ Created repository:', repo.full_name);
  
  // Clean up
  await octokit.repos.delete({
    owner: user.login,
    repo: repo.name,
  });
  console.log('✓ Deleted test repository');
  
  console.log('\nAuthentication test passed!');
} catch (error) {
  console.error('✗ Authentication test failed:', error.message);
  if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
  }
}