async function ImportExcelButton() {
  try {
    await fetch("https://face.taqsim.uz/api/students/upload-excel");
  } catch (error) {
    console.error("Error uploading file:", error);
    alert("Error uploading file. Please try again.");
  }
}

export default ImportExcelButton;
