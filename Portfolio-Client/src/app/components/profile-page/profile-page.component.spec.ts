import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideMarkdown } from "ngx-markdown";
import { ProfilePageComponent } from "./profile-page.component";
import { Project } from "../../services/project.service";
import { UserProfile } from "../../services/profile.service";

function makeProject(id: number): Project {
  return {
    id,
    name: `Project ${id}`,
    description: "",
    downloads: "0",
    videoLayout: "above",
    profileId: 1,
    order: id,
    tags: [],
  };
}

function makeProfile(overrides: Partial<UserProfile>): UserProfile {
  return {
    id: 1,
    name: "",
    role: "",
    bio: "",
    photoUrl: "",
    cvUrl: "",
    email: "",
    slug: "unity",
    themeKey: "unity",
    projectsStatLabel: null,
    stat2Label: null,
    stat2Value: null,
    stat3Label: null,
    stat3Value: null,
    ...overrides,
  };
}

describe("ProfilePageComponent hero stats", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideMarkdown(),
      ],
    });
  });

  it("projectCount reflects the number of loaded projects", () => {
    const fixture = TestBed.createComponent(ProfilePageComponent);
    const component = fixture.componentInstance;
    component.projects.set([makeProject(1), makeProject(2), makeProject(3)]);
    expect(component.projectCount()).toBe(3);
  });

  it("hides slot 1 when the project count is zero even if a label is set", () => {
    const fixture = TestBed.createComponent(ProfilePageComponent);
    const component = fixture.componentInstance;
    component.profile.set(makeProfile({ projectsStatLabel: "GAMES" }));
    component.projects.set([]);
    expect(component.heroStats()).toEqual([]);
  });

  it("hides slot 3 when only its label is set and includes complete slots 1 and 2", () => {
    const fixture = TestBed.createComponent(ProfilePageComponent);
    const component = fixture.componentInstance;
    component.profile.set(
      makeProfile({
        projectsStatLabel: "GAMES",
        stat2Label: "DOWNLOADS",
        stat2Value: "100K+",
        stat3Label: "YRS XP",
        stat3Value: null,
      }),
    );
    component.projects.set([makeProject(1)]);
    expect(component.heroStats()).toEqual([
      { label: "GAMES", value: "1+" },
      { label: "DOWNLOADS", value: "100K+" },
    ]);
  });
});
