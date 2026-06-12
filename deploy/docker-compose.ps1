param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$ComposeArgs
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$localEnvFile = Join-Path $projectRoot '.env.docker.local'
$backendSecretFile = Join-Path $projectRoot 'backend-java-reference\application-secret.yml'
$envFile = $localEnvFile
$composeFile = Join-Path $projectRoot 'docker-compose.yml'

if ($env:COMPOSE_PROJECT_NAME -and $env:COMPOSE_PROJECT_NAME.Trim() -eq '') {
  Remove-Item Env:COMPOSE_PROJECT_NAME -ErrorAction SilentlyContinue
}

if (-not (Test-Path $localEnvFile)) {
  throw "Missing private docker env file: $localEnvFile. Create .env.docker.local from .env.docker.example first."
}

if (-not (Test-Path $backendSecretFile)) {
  throw "Missing backend secret file: $backendSecretFile. Create application-secret.yml from backend-java-reference/application-secret.example.yml first."
}

if (-not $ComposeArgs -or $ComposeArgs.Count -eq 0) {
  $ComposeArgs = @('ps')
}

docker compose --project-name neighborhood --env-file $envFile -f $composeFile @ComposeArgs
