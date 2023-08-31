new Vue({
    el: '#app',
    data: {
        examName: '',
        studentCount: '',
        teacherLink: '',
        studentLinks: [],
        currentPage: 'initial',
        showErrorMessage: false
    },
    methods: {
        validateAndShowLinks() {
            if (this.studentCount !== '' && !this.isNumeric(this.studentCount)) {
                this.showErrorMessage = true;
            } else {
                this.showErrorMessage = false;
                this.generateLinks();
            }
        },
        generateLinks() {
            if (this.isNumeric(this.studentCount)) {
                this.teacherLink = `https://47.103.117.247/teacher?exam_id=${encodeURIComponent(this.examName)}&room_size=${this.studentCount}`;
                this.studentLinks = [];
                for (let i = 1; i <= this.studentCount; i++) {
                    const studentLink = `https://47.103.117.247/student?exam_id=${encodeURIComponent(this.examName)}&stu_id=${i}`;
                    this.studentLinks.push(studentLink);
                }
                this.currentPage = 'links';
            }
        },
        isNumeric(value) {
            return /^\d+$/.test(value);
        }
    }
});
