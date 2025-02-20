// Keep track of the original open states
let detailsState = [];

window.addEventListener("beforeprint", () => {
  detailsState = []; // Reset the state array

  // Find all <details> under #section-toc
  const details = document.querySelectorAll("#section-toc details");

  details.forEach((detail) => {
    // Save the current state
    detailsState.push({
      element: detail,
      isOpen: detail.hasAttribute("open"),
    });

    // Ensure all details are expanded
    detail.setAttribute("open", "");
  });
});

window.addEventListener("afterprint", () => {
  // Restore the saved open states
  detailsState.forEach(({ element, isOpen }) => {
    if (isOpen) {
      element.setAttribute("open", "");
    } else {
      element.removeAttribute("open");
    }
  });

  // Clear the state array
  detailsState = [];
});
