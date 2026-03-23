# FoodExpress CI/CD Pipeline

This is one of the class assignment in Cloud Automation using DevOps (CLD 373) that builds an automated deployment pipeline for a food ordering REST API using Jenkins, Docker, AWS EC2, and GitHub Webhooks.

## What This Project Does

Every time code is pushed to GitHub, the pipeline automatically:
1. Pulls the latest code
2. Installs dependencies
3. Runs tests
4. Builds a Docker image
5. Deploys it to an EC2 server

No manual deployment needed.

## Tools Used

- **Node.js + Express** — REST API
- **Docker** — containerize the app
- **Jenkins** — automate the pipeline
- **AWS EC2** — cloud server (Ubuntu)
- **GitHub Webhooks** — trigger pipeline on push

## API Endpoints

Base URL: `http://<EC2_PUBLIC_IP>:3000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all menu items |
| GET | `/api/menu/:id` | Get one menu item |
| POST | `/api/menu` | Add a menu item |
| PUT | `/api/menu/:id` | Update a menu item |
| DELETE | `/api/menu/:id` | Delete a menu item |
| GET | `/api/orders` | Get all orders |
| POST | `/api/orders` | Place an order |
| PUT | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Delete an order |

---

## How to Run Locally

```bash
git clone https://github.com/<YOUR_USERNAME>/foodexpress-cicd-pipeline.git
cd foodexpress-cicd-pipeline
npm install
node index.js
```

Then open: `http://localhost:3000/api/menu`

## Project Structure

foodexpress-cicd-pipeline/
├── index.js          ← API code
├── index.test.js     ← Tests
├── package.json      ← Dependencies
├── Dockerfile        ← Docker setup
├── Jenkinsfile       ← Pipeline stages
└── README.md


## Pipeline Stages


Checkout → Install → Test → Build Image → Remove Old → Deploy → Health Check


---

## Notes

- `.pem` and `.env` files are excluded via `.gitignore` 
- Jenkins must have Docker permissions: `sudo usermod -aG docker jenkins`
- Webhook URL format: `http://<EC2_IP>:8080/github-webhook/`
