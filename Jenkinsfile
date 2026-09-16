pipeline {
    agent any

    stages {
        stage('Deploy Frontend') {
            steps {
                dir('/mnt/var/www/nex-chat/nex-chat-fe') {
                    sh '''
                        set -e

                        echo "=== Checkout developer ==="
                        git checkout developer

                        OLD_COMMIT=$(git rev-parse HEAD)

                        echo "=== Pull latest code ==="
                        git fetch origin
                        git reset --hard origin/developer

                        NEW_COMMIT=$(git rev-parse HEAD)

                        echo "Old commit: $OLD_COMMIT"
                        echo "New commit: $NEW_COMMIT"

                        echo "=== Check dependencies ==="

                        if git diff --name-only "$OLD_COMMIT" "$NEW_COMMIT" \
                            | grep -Eq "^(package.json|package-lock.json)$"; then

                            echo "Dependencies changed -> npm install"
                            npm i -f
                        else
                            echo "Dependencies unchanged -> skip npm install"
                        fi

                        echo "=== Build frontend ==="
                        npm run build

                        echo "=== Restart PM2 ==="
                        pm2 restart nex-chat-fe

                        echo "=== Deploy completed ==="
                    '''
                }
            }
        }
    }
}
