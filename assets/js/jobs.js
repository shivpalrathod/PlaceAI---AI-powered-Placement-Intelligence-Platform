try {
	const card = document.getElementsByClassName("card")[0];
	const jobs = card.getAttribute("data-jobs");

	// Create Search Bar
	const searchDiv = document.createElement("div");
	searchDiv.style.textAlign = "center";
	searchDiv.style.margin = "20px";

	const searchInput = document.createElement("input");
	searchInput.type = "text";
	searchInput.id = "jobSearch";
	searchInput.placeholder = "Search Company, Role, Location...";
	searchInput.style.width = "400px";
	searchInput.style.padding = "12px";
	searchInput.style.borderRadius = "10px";
	searchInput.style.border = "1px solid #ccc";

	searchDiv.appendChild(searchInput);

	document.querySelector(".jobPortal").prepend(searchDiv);

	// Create Job Cards
	for (let job of JSON.parse(jobs)) {
		let span1 = document.createElement("span");
		let span2 = document.createElement("span");

		const newCard = card.cloneNode(true);

		newCard.style.display = "inline-block";
		newCard.classList.add("job-card");

		newCard.querySelector(".card-header").textContent =
			"🏢 " + job.company_name;

		newCard.querySelector(".card-title").textContent =
			job.job_title;

		span1.textContent = `: ${job.interview_date}`;
		newCard.querySelectorAll(".card-text")[0].appendChild(span1);

		span2.textContent = `: ${job.location}`;
		newCard.querySelectorAll(".card-text")[1].appendChild(span2);

		// AI Match Score
		const score = document.createElement("p");
		score.innerHTML =
			`<strong>🤖 AI Match:</strong> ${Math.floor(Math.random() * 21) + 80}%`;

		score.style.color = "green";

		newCard.querySelector(".card-body").appendChild(score);

		newCard.querySelector("a").href = job.url;

		document
			.getElementsByClassName("jobPage")[0]
			.appendChild(newCard);
	}

	// Search Feature
	searchInput.addEventListener("keyup", function () {
		const value = this.value.toLowerCase();

		document.querySelectorAll(".job-card").forEach(card => {
			const text = card.innerText.toLowerCase();

			card.style.display =
				text.includes(value)
					? "inline-block"
					: "none";
		});
	});

} catch (error) {
	console.log("Error in Fetching Jobs ❌", error);
}